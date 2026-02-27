import { NextResponse } from "next/server";
import { createSignedState } from "@/lib/oauth-state";

/**
 * /scheduler dashboard → 回傳帶按鈕的 Embed（type: 4）
 */
export async function handleDashboardCommand(
  interaction: Record<string, unknown>
) {
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
