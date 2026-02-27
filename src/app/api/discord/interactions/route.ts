import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "@/lib/discord/verify";
import { supabase } from "@/lib/supabase";
import type { MeetingInsert } from "@/lib/supabase/database.types";
import { createSignedState } from "@/lib/oauth-state";

/**
 * Discord Interactions Endpoint
 * POST /api/discord/interactions
 *
 * 處理所有 Discord 互動：Slash Commands、Modal Submit、Button 等
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "缺少簽名標頭" },
      { status: 401 }
    );
  }

  // 驗證請求是否來自 Discord
  const isValid = verifyKey(body, signature, timestamp);
  if (!isValid) {
    return NextResponse.json(
      { error: "無效的請求簽名" },
      { status: 401 }
    );
  }

  const interaction = JSON.parse(body);

  // 回應 PING（type: 1）
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 處理 Application Command（type: 2）
  if (interaction.type === 2) {
    return await handleApplicationCommand(interaction);
  }

  // 處理 Modal Submit（type: 5）
  if (interaction.type === 5) {
    return await handleModalSubmit(interaction);
  }

  return NextResponse.json({ error: "未知的互動類型" }, { status: 400 });
}

/**
 * 處理 /scheduler 指令的子指令
 */
async function handleApplicationCommand(interaction: Record<string, unknown>) {
  const data = interaction.data as {
    name: string;
    options?: Array<{ name: string; type: number; options?: Array<{ name: string; value: string }> }>;
  };

  if (data.name !== "scheduler") {
    return NextResponse.json({
      type: 4,
      data: { content: `❓ 未知的指令：${data.name}` },
    });
  }

  const subcommand = data.options?.[0]?.name;

  switch (subcommand) {
    case "meeting":
      return handleMeetingCommand();
    case "dashboard":
      return await handleDashboardCommand(interaction);
    default:
      return NextResponse.json({
        type: 4,
        data: { content: `❓ 未知的子指令：${subcommand}` },
      });
  }
}

/**
 * /scheduler meeting → 回傳 Modal（type: 9）
 */
function handleMeetingCommand() {
  return NextResponse.json({
    type: 9, // MODAL
    data: {
      custom_id: "scheduler_meeting_modal",
      title: "建立會議排程",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_name",
              label: "會議名稱",
              style: 1,
              placeholder: "例如：GDG 週會",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_participants",
              label: "預計參與人數",
              style: 1,
              placeholder: "例如：10",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_date_range",
              label: "日期範圍（起始 ~ 結束）",
              style: 1,
              placeholder: "例如：2025-01-20 ~ 2025-01-25",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_description",
              label: "會議描述（選填）",
              style: 2,
              placeholder: "會議議程或備註...",
              required: false,
            },
          ],
        },
      ],
    },
  });
}

/**
 * /scheduler dashboard → 回傳帶按鈕的 Embed（type: 4）
 */
async function handleDashboardCommand(interaction: Record<string, unknown>) {
  const clientId = process.env.DISCORD_APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      type: 4,
      data: {
        content: "❌ Bot 尚未完成設定，請聯繫管理員。",
        flags: 64,
      },
    });
  }

  // 產生 HMAC 簽章的 state
  const state = await createSignedState({ redirect: "dashboard" });

  const oauthUrl =
    `https://discord.com/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&scope=identify` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&prompt=none`;

  return NextResponse.json({
    type: 4,
    data: {
      embeds: [
        {
          title: "📊 GDG 會議排程儀表板",
          description:
            "透過 Discord 帳號登入即可查看你的會議歷史與目前排程。",
          color: 0x5865f2,
          footer: { text: "GDG Scheduler Bot" },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5, // Link button
              label: "開啟儀表板",
              url: oauthUrl,
              emoji: { name: "🔗" },
            },
          ],
        },
      ],
      flags: 64, // Ephemeral
    },
  });
}

/**
 * 處理 Modal 提交 — 建立會議 Embed + 填寫按鈕
 */
async function handleModalSubmit(interaction: Record<string, unknown>) {
  const data = interaction.data as {
    custom_id: string;
    components: Array<{
      components: Array<{ custom_id: string; value: string }>;
    }>;
  };

  if (data.custom_id !== "scheduler_meeting_modal") {
    return NextResponse.json({
      type: 4,
      data: { content: "❓ 未知的 Modal 提交" },
    });
  }

  // 解析 Modal 欄位
  const fields = data.components.flatMap((row) => row.components);
  const getValue = (id: string) =>
    fields.find((f) => f.custom_id === id)?.value ?? "";

  const meetingName = getValue("meeting_name");
  const participants = getValue("meeting_participants");
  const dateRange = getValue("meeting_date_range");
  const description = getValue("meeting_description") || "無描述";

  const meetingId = `MTG-${Date.now().toString(36).toUpperCase()}`;
  const clientId = process.env.DISCORD_APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const user = interaction.member as { user?: { id: string; username?: string; global_name?: string } } | undefined;
  const userId = user?.user?.id ?? "unknown";
  const creatorUsername = user?.user?.global_name || user?.user?.username || "unknown";

  // 解析日期範圍
  const dateParts = dateRange.split("~").map((s: string) => s.trim());
  const dateStart = dateParts[0] || dateRange;
  const dateEnd = dateParts[1] || dateParts[0] || dateRange;

  // 將會議資料儲存到 Supabase
  try {
    await supabase.from("meetings").insert({
      id: meetingId,
      name: meetingName,
      description,
      participants_count: parseInt(participants) || 0,
      date_range_start: dateStart,
      date_range_end: dateEnd,
      creator_discord_id: userId,
      creator_username: creatorUsername,
      guild_id: (interaction.guild_id as string) || null,
      channel_id: (interaction.channel_id as string) || null,
    } satisfies MeetingInsert);
  } catch (err) {
    console.error("儲存會議到 Supabase 失敗：", err);
  }

  // 建立 OAuth2 URL，讓使用者登入後導向會議頁面
  let fillUrl: string;
  if (clientId && redirectUri) {
    const state = await createSignedState({ redirect: meetingId });
    fillUrl =
      `https://discord.com/oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&scope=identify` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=none`;
  } else {
    fillUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/meeting/${meetingId}`;
  }

  return NextResponse.json({
    type: 4,
    data: {
      embeds: [
        {
          title: `📅 ${meetingName}`,
          description,
          fields: [
            { name: "📋 會議 ID", value: meetingId, inline: true },
            { name: "👥 預計人數", value: participants, inline: true },
            { name: "📆 日期範圍", value: dateRange, inline: false },
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
