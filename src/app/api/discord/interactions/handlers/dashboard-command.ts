import { NextResponse } from "next/server";

/**
 * /meeting dashboard → 回傳帶按鈕的 Embed（type: 4）
 */
export async function handleDashboardCommand(
  interaction: Record<string, unknown>
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 按鈕連結到 /api/auth/discord，每次點擊都即時產生新的 signed state（避免 10 分鐘過期問題）
  const oauthUrl = `${appUrl}/api/auth/discord?redirect=dashboard`;

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
