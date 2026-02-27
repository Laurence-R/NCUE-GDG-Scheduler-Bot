/**
 * 根據 Discord user ID 與 avatar hash 產生頭像 URL
 * - 若有 avatar hash → https://cdn.discordapp.com/avatars/{id}/{hash}.png (或 .gif)
 * - 若無 → Discord 預設頭像
 *
 * 此函式可在 Server 與 Client 元件中共用。
 */
export function getAvatarUrl(
  userId: string,
  avatarHash: string | null
): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}`;
  }
  // 新版 Discord 用 (user_id >> 22) % 6 決定預設頭像
  const index = Number(BigInt(userId) >> BigInt(22)) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
