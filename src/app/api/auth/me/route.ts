import { getSessionUser, getAvatarUrl } from "@/lib/auth";
import { apiOk } from "@/lib/api-response";

/**
 * GET /api/auth/me
 * 取得目前登入的使用者資訊（從 Cookie 讀取）
 */
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return apiOk({ user: null });
  }

  return apiOk({
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      avatar_url: getAvatarUrl(user.id, user.avatar),
    },
  });
}
