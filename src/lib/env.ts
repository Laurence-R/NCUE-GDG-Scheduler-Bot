/**
 * 環境變數集中驗證
 *
 * 使用 Proxy 延遲驗證：import 時不會立即讀取環境變數，
 * 只在實際存取屬性時才驗證，避免 Next.js build 階段因環境變數未注入而失敗。
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
 * 伺服器端必要環境變數（lazy — 只在存取時才驗證）
 *
 * 注意：此模組只能在 server 端使用。
 */
interface Env {
  readonly DISCORD_CLIENT_SECRET: string;
  readonly DISCORD_APP_ID: string;
  readonly DISCORD_REDIRECT_URI: string;
  readonly DISCORD_PUBLIC_KEY: string;
  readonly NEXT_PUBLIC_APP_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

const envGetters: Record<keyof Env, () => string> = {
  DISCORD_CLIENT_SECRET: () => requireEnv("DISCORD_CLIENT_SECRET"),
  DISCORD_APP_ID: () => requireEnv("DISCORD_APP_ID"),
  DISCORD_REDIRECT_URI: () => requireEnv("DISCORD_REDIRECT_URI"),
  DISCORD_PUBLIC_KEY: () => requireEnv("DISCORD_PUBLIC_KEY"),
  NEXT_PUBLIC_APP_URL: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};

export const env: Env = new Proxy({} as Env, {
  get(_, prop: string) {
    const getter = envGetters[prop as keyof Env];
    if (!getter) throw new Error(`Unknown env key: ${prop}`);
    return getter();
  },
});
