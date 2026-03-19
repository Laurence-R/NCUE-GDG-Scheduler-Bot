import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type {
  MeetingInsert,
  MeetingMemberInsert,
} from "@/lib/supabase/database.types";

/** Discord REST API base URL */
const DISCORD_API = "https://discord.com/api/v10";

/**
 * Discord Guild Member（精簡版，只取需要的欄位）
 */
interface DiscordGuildMember {
  user?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
}

/**
 * 透過 Discord REST API 取得指定身分組的成員清單
 */
async function fetchRoleMembers(
  guildId: string,
  roleId: string,
  botToken: string
): Promise<DiscordGuildMember[]> {
  const members: DiscordGuildMember[] = [];
  let after: string | undefined;

  // Discord 一次最多回傳 1000 筆，用分頁取完
  while (true) {
    const url = new URL(`${DISCORD_API}/guilds/${guildId}/members`);
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!res.ok) {
      throw new Error(`Discord API 錯誤 (${res.status}): ${await res.text()}`);
    }

    const batch: Array<DiscordGuildMember & { roles?: string[] }> =
      await res.json();

    if (batch.length === 0) break;

    // 只保留擁有目標角色的成員
    for (const m of batch) {
      if (m.roles?.includes(roleId)) {
        members.push(m);
      }
    }

    // 不足 1000 表示已取完
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user?.id;
  }

  return members;
}

/**
 * 處理 Modal 提交 — 建立會議 + 成員快照 + Embed
 */
export async function handleModalSubmit(
  interaction: Record<string, unknown>
) {
  const data = interaction.data as {
    custom_id: string;
    components: Array<{
      components: Array<{ custom_id: string; value: string }>;
    }>;
  };

  // custom_id 格式: "meeting_build_modal:{roleId}"
  if (!data.custom_id.startsWith("meeting_build_modal:")) {
    return NextResponse.json({
      type: 4,
      data: { content: "❓ 未知的 Modal 提交" },
    });
  }

  const roleId = data.custom_id.split(":")[1];

  // 解析 Modal 欄位
  const fields = data.components.flatMap((row) => row.components);
  const getValue = (id: string) =>
    fields.find((f) => f.custom_id === id)?.value ?? "";

  const meetingName = getValue("meeting_name");
  const dateRange = getValue("meeting_date_range");
  const durationRaw = getValue("meeting_duration");
  const description = getValue("meeting_description") || "無描述";

  // 解析會議時長（預設 60 分鐘）
  const durationMinutes = Math.max(
    30,
    Math.min(480, parseInt(durationRaw) || 60)
  );

  const meetingId = `MTG-${Date.now().toString(36).toUpperCase()}`;
  const clientId = process.env.DISCORD_APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = interaction.guild_id as string | undefined;

  const user = interaction.member as
    | {
        user?: {
          id: string;
          username?: string;
          global_name?: string;
          avatar?: string | null;
        };
      }
    | undefined;
  const userId = user?.user?.id ?? "unknown";
  const creatorUsername =
    user?.user?.global_name || user?.user?.username || "unknown";
  const creatorAvatar = user?.user?.avatar ?? null;

  // 驗證並解析日期範圍（格式: YYYY-MM-DD ~ YYYY-MM-DD）
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const dateParts = dateRange.split("~").map((s: string) => s.trim());
  const dateStart = dateParts[0] || "";
  const dateEnd = dateParts[1] || dateParts[0] || "";

  if (
    !DATE_RE.test(dateStart) ||
    !DATE_RE.test(dateEnd) ||
    isNaN(Date.parse(dateStart)) ||
    isNaN(Date.parse(dateEnd)) ||
    dateStart > dateEnd
  ) {
    return NextResponse.json({
      type: 4,
      data: {
        content:
          "❌ 日期範圍格式錯誤，請使用 `YYYY-MM-DD ~ YYYY-MM-DD`（例如 2025-01-20 ~ 2025-01-25）",
        flags: 64,
      },
    });
  }

  // ── 成員快照 ──────────────────────────────────────────
  let memberRows: MeetingMemberInsert[] = [];

  if (guildId && botToken) {
    try {
      const guildMembers = await fetchRoleMembers(guildId, roleId, botToken);

      memberRows = guildMembers
        .filter((m) => m.user)
        .map((m) => ({
          meeting_id: meetingId,
          discord_id: m.user!.id,
          username: m.user!.global_name || m.user!.username,
          avatar_hash: m.user!.avatar ?? null,
          is_organizer: m.user!.id === userId,
        }));

      // 確保發起人一定在名單中
      if (!memberRows.some((r) => r.discord_id === userId)) {
        memberRows.push({
          meeting_id: meetingId,
          discord_id: userId,
          username: creatorUsername,
          avatar_hash: creatorAvatar,
          is_organizer: true,
        });
      }
    } catch (err) {
      console.error("取得身分組成員失敗：", err);
      return NextResponse.json({
        type: 4,
        data: {
          content:
            "❌ 無法取得身分組成員清單，請確認 Bot 有 `Server Members Intent` 權限。",
          flags: 64,
        },
      });
    }
  } else {
    // Fallback：無法取得成員時，僅加入發起人
    memberRows = [
      {
        meeting_id: meetingId,
        discord_id: userId,
        username: creatorUsername,
        avatar_hash: creatorAvatar,
        is_organizer: true,
      },
    ];
  }

  // ── 儲存會議 ──────────────────────────────────────────
  const { error: insertError } = await supabase.from("meetings").insert({
    id: meetingId,
    name: meetingName,
    description,
    duration_minutes: durationMinutes,
    date_range_start: dateStart,
    date_range_end: dateEnd,
    creator_discord_id: userId,
    creator_username: creatorUsername,
    role_id: roleId,
    guild_id: guildId || null,
    channel_id: (interaction.channel_id as string) || null,
  } satisfies MeetingInsert);

  if (insertError) {
    console.error("儲存會議到 Supabase 失敗：", insertError);
    return NextResponse.json({
      type: 4,
      data: {
        content: `❌ 建立會議失敗：${insertError.message}`,
        flags: 64,
      },
    });
  }

  // ── 儲存成員快照 ────────────────────────────────────────
  if (memberRows.length > 0) {
    const { error: membersError } = await supabase
      .from("meeting_members")
      .insert(memberRows);

    if (membersError) {
      console.error("儲存成員快照失敗：", membersError);
      // 會議已建立，成員寫入失敗不阻擋流程，但記錄錯誤
    }
  }

  // ── 回傳 Embed ──────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // 按鈕連結到 /api/auth/discord，每次點擊都即時產生新的 signed state（避免 10 分鐘過期問題）
  const fillUrl = `${appUrl}/api/auth/discord?redirect=${meetingId}`;

  return NextResponse.json({
    type: 4,
    data: {
      embeds: [
        {
          title: `📅 ${meetingName}`,
          description,
          fields: [
            { name: "📋 會議 ID", value: meetingId, inline: true },
            {
              name: "👥 受邀成員",
              value: `<@&${roleId}> (${memberRows.length} 人)`,
              inline: true,
            },
            { name: "📆 日期範圍", value: dateRange, inline: false },
            {
              name: "⏱️ 會議時長",
              value: `${durationMinutes} 分鐘`,
              inline: true,
            },
            { name: "👤 發起人", value: `<@${userId}>`, inline: true },
          ],
          color: 0x00d26a,
          timestamp: new Date().toISOString(),
          footer: { text: "點擊下方按鈕填寫你的可用時間" },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5, // Link button
              label: "填寫可用時間",
              url: fillUrl,
              emoji: { name: "✏️" },
            },
          ],
        },
      ],
    },
  });
}
