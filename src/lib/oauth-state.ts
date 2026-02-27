/**
 * OAuth2 State 簽章與驗證
 *
 * 使用 HMAC-SHA256 對 state 參數進行簽章，
 * 確保 callback 收到的 state 是由本伺服器產生的。
 * 不需要 session/cookie 儲存——完全 stateless。
 */

import { timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000; // state 有效期 10 分鐘

function getSecret(): string {
  // 使用 DISCORD_CLIENT_SECRET 作為 HMAC 密鑰
  // 這個值本來就是機密，且每個部署環境不同
  const secret = process.env.DISCORD_CLIENT_SECRET;
  if (!secret) throw new Error("DISCORD_CLIENT_SECRET is not set");
  return secret;
}

/** 將 Uint8Array 轉為 hex string */
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** URL-safe Base64 編碼 */
function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** URL-safe Base64 解碼 */
function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

/** 用 Web Crypto API 計算 HMAC-SHA256 */
async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

export interface OAuthStatePayload {
  /** 授權完成後要導向的路徑，例如 "dashboard" 或 "MTG-xxx" */
  redirect: string;
}

/**
 * 產生已簽章的 state 字串
 * 格式：base64url(JSON).hmac_hex
 */
export async function createSignedState(
  payload: OAuthStatePayload
): Promise<string> {
  const data = {
    ...payload,
    nonce: crypto.randomUUID(),
    exp: Date.now() + STATE_TTL_MS,
  };
  const encoded = base64urlEncode(JSON.stringify(data));
  const signature = await hmacSign(encoded);
  return `${encoded}.${signature}`;
}

/**
 * 驗證並解析 state 字串
 * @returns payload if valid, null if invalid/expired
 */
export async function verifySignedState(
  state: string
): Promise<OAuthStatePayload | null> {
  const dotIndex = state.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = state.substring(0, dotIndex);
  const signature = state.substring(dotIndex + 1);

  // 驗證簽章（constant-time comparison 防止 timing attack）
  const expected = await hmacSign(encoded);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  // 解析 payload
  try {
    const data = JSON.parse(base64urlDecode(encoded));

    // 檢查過期
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;

    return { redirect: data.redirect ?? "dashboard" };
  } catch {
    return null;
  }
}
