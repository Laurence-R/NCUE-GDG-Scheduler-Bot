import { cookies } from "next/headers";

// Re-export for backward compatibility (server-side consumers)
export { getAvatarUrl } from "./avatar";

/**
 * Discord 使用者 Session 資料
 */
export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null; // Discord avatar hash
}

/**
 * 從 Cookie 取得目前登入的使用者（Server 端使用）
 */
export async function getSessionUser(): Promise<DiscordUser | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("discord_user");
  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie.value) as DiscordUser;
  } catch {
    return null;
  }
}

/**
 * 設定使用者 Session Cookie
 */
export async function setSessionUser(user: DiscordUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("discord_user", JSON.stringify(user), {
    httpOnly: false, // Client 端也需要讀取
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
}

/**
 * 清除使用者 Session Cookie
 */
export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("discord_user");
}
