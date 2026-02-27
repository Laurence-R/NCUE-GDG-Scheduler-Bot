import { NextRequest, NextResponse } from "next/server";
import { createSignedState } from "@/lib/oauth-state";

/**
 * Discord OAuth2 授權入口
 * GET /api/auth/discord?redirect=dashboard
 *
 * 重新導向使用者至 Discord OAuth2 授權頁面。
 * 使用 HMAC 簽章的 state 參數防止 CSRF 攻擊。
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "缺少 Discord 設定" },
      { status: 500 }
    );
  }

  // 從 query string 取得授權後要導向的目標
  const redirect = request.nextUrl.searchParams.get("redirect") || "dashboard";

  // 產生 HMAC 簽章的 state（包含 redirect 目標、nonce、過期時間）
  const state = await createSignedState({ redirect });

  const scopes = ["identify", "guilds"].join("%20");

  const authUrl =
    `https://discord.com/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&scope=${scopes}` +
    `&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
