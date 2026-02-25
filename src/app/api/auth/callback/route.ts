import { NextRequest, NextResponse } from "next/server";

/**
 * Discord OAuth2 Callback
 * GET /api/auth/callback
 *
 * Discord 授權完成後會重新導向到此端點，
 * 攜帶 authorization code，用來交換 access token。
 *
 * 依照 state 參數決定重新導向的目標：
 * - state="dashboard" → /dashboard
 * - state=meetingId  → /meeting/{meetingId}?discord_id=xxx&username=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "缺少授權碼" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // 用 authorization code 交換 access token
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        client_id: process.env.DISCORD_APP_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange 失敗：", errorData);
      return NextResponse.json(
        { error: "授權失敗" },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();

    // 取得使用者資訊
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "無法取得使用者資訊" },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const discordId = userData.id;
    const username = userData.global_name || userData.username;

    console.log(`✅ 使用者已授權：${username} (${discordId})`);

    // 依照 state 決定重新導向
    if (state === "dashboard") {
      return NextResponse.redirect(
        `${appUrl}/dashboard?login=success&discord_id=${discordId}&username=${encodeURIComponent(username)}`
      );
    }

    // state 可能是 meetingId，導向到會議頁面
    if (state && state.startsWith("MTG-")) {
      return NextResponse.redirect(
        `${appUrl}/meeting/${state}?discord_id=${discordId}&username=${encodeURIComponent(username)}`
      );
    }

    // 預設導向儀表板
    return NextResponse.redirect(
      `${appUrl}/dashboard?login=success&discord_id=${discordId}&username=${encodeURIComponent(username)}`
    );
  } catch (error) {
    console.error("OAuth2 callback 錯誤：", error);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
