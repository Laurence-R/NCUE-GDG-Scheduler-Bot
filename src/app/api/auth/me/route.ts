import { NextResponse } from "next/server";
import { getSessionUser, getAvatarUrl } from "@/lib/auth";

/**
 * GET /api/auth/me
 * 取得目前登入的使用者資訊（從 Cookie 讀取）
 */
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      avatar_url: getAvatarUrl(user.id, user.avatar),
    },
  });
}
