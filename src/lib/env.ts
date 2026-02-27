/**
 * 環境變數集中驗證
 *
 * 在模組載入時即驗證所有必要環境變數是否存在，
 * 避免在 runtime 才因為 process.env.XXX 為 undefined 而爆炸。
 * 使用者只需 `import { env } from "@/lib/env"` 即可取得型別安全的值。
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ 缺少必要環境變數 ${key}，請確認 .env 或部署平台設定。`
    );
  }
  return value;
}

/**
 * 伺服器端必要環境變數（在 import 時即驗證）
 *
 * 注意：此模組只能在 server 端使用。
 * NEXT_PUBLIC_* 開頭的變數在 client/server 皆可用，但此處統一管理。
 */
export const env = {
  /** Discord OAuth2 / Bot */
  DISCORD_CLIENT_SECRET: requireEnv("DISCORD_CLIENT_SECRET"),
  DISCORD_APP_ID: requireEnv("DISCORD_APP_ID"),
  DISCORD_REDIRECT_URI: requireEnv("DISCORD_REDIRECT_URI"),
  DISCORD_PUBLIC_KEY: requireEnv("DISCORD_PUBLIC_KEY"),

  /** Application */
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  /** Supabase */
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
