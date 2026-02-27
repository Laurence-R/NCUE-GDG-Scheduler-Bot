import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSignedState } from "@/lib/oauth-state";
import type { MeetingInsert } from "@/lib/supabase/database.types";

/**
 * 處理 Modal 提交 — 建立會議 Embed + 填寫按鈕
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
  const user = interaction.member as
    | { user?: { id: string; username?: string; global_name?: string } }
    | undefined;
  const userId = user?.user?.id ?? "unknown";
  const creatorUsername =
    user?.user?.global_name || user?.user?.username || "unknown";

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
