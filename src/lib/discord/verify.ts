/**
 * Discord Interaction 請求簽名驗證
 *
 * 使用 tweetnacl 的 Ed25519 驗證從 Discord 傳來的請求是否合法，
 * 防止偽造的請求攻擊。
 */

import nacl from "tweetnacl";
import { env } from "@/lib/env";

export function verifyKey(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const publicKey = env.DISCORD_PUBLIC_KEY;

  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      Buffer.from(publicKey, "hex")
    );
  } catch (error) {
    console.error("簽名驗證錯誤：", error);
    return false;
  }
}
