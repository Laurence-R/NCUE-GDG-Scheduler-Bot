import { NextRequest, NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";
import { verifySignedState } from "@/lib/oauth-state";
import { env } from "@/lib/env";

/**
 * Discord OAuth2 Callback
 * GET /api/auth/callback
 *
 * Discord 授權完成後會重新導向到此端點，
 * 攜帶 authorization code，用來交換 access token。
 *
 * 驗證 HMAC 簽章的 state 參數後，依照其中的 redirect 欄位
 * 決定重新導向的目標。
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "缺少授權碼" },
      { status: 400 }
    );
  }

  // 驗證 state 的 HMAC 簽章與過期時間
  const statePayload = rawState ? await verifySignedState(rawState) : null;
  if (!statePayload) {
    return NextResponse.json(
      { error: "無效或過期的授權請求，請重新操作" },
      { status: 403 }
    );
  }

  const redirectTarget = statePayload.redirect;
  const appUrl = env.NEXT_PUBLIC_APP_URL;

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
        redirect_uri: env.DISCORD_REDIRECT_URI,
        client_id: env.DISCORD_APP_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
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
    const avatarHash: string | null = userData.avatar ?? null;

    console.log(`✅ 使用者已授權：${username} (${discordId}), avatar: ${avatarHash}`);

    // 將使用者資訊寫入 Cookie（7 天有效）
    await setSessionUser({ id: discordId, username, avatar: avatarHash });

    // 依照 state payload 中的 redirect 決定導向目標
    // 使用者資訊已寫入 httpOnly cookie，不再透過 URL 傳遞（避免洩漏）
    if (redirectTarget.startsWith("MTG-")) {
      return NextResponse.redirect(
        `${appUrl}/meeting/${redirectTarget}`
      );
    }

    // 預設導向儀表板
    return NextResponse.redirect(
      `${appUrl}/dashboard?login=success`
    );
  } catch (error) {
    console.error("OAuth2 callback 錯誤：", error);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
