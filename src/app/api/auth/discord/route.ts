import { NextResponse } from "next/server";

/**
 * Discord OAuth2 授權入口
 * GET /api/auth/discord
 *
 * 重新導向使用者至 Discord OAuth2 授權頁面
 */
export async function GET() {
  const clientId = process.env.DISCORD_APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "缺少 Discord 設定" },
      { status: 500 }
    );
  }

  // 產生隨機 state 防止 CSRF 攻擊
  const state = crypto.randomUUID();

  // 請求的 OAuth2 Scopes
  const scopes = ["identify", "guilds"].join("%20");

  const authUrl =
    `https://discord.com/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&scope=${scopes}` +
    `&state=${state}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&prompt=consent`;

  // TODO: 將 state 儲存到 session 或 cookie 中以供回調驗證

  return NextResponse.redirect(authUrl);
}
