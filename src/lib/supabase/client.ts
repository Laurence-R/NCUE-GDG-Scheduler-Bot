import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Supabase 伺服器端客戶端 (server-only)
 *
 * 使用 SUPABASE_SERVICE_ROLE_KEY 存取（繞過 RLS）。
 * 此 key 為必要設定，因為 RLS 策略僅允許 service_role 執行寫入操作。
 *
 * 採用延遲初始化：build 階段不需要環境變數，只在 runtime 首次使用時才檢查。
 *
 * ⚠️ 此模組透過 `server-only` 確保不會被打包進 client bundle。
 */

let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase;

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "❌ 缺少 Supabase 環境變數。" +
      " 請確認 SUPABASE_SERVICE_ROLE_KEY 已設定（RLS 策略要求 service_role 才能寫入）。" +
      " 同時需要 SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_URL。"
    );
  }

  _supabase = createClient<Database>(supabaseUrl, supabaseKey);
  return _supabase;
}

/**
 * Supabase 單例客戶端（Proxy 實現延遲初始化）
 *
 * 使用方式與直接匯出的 SupabaseClient 相同：
 * ```ts
 * import { supabase } from "@/lib/supabase";
 * const { data } = await supabase.from("meetings").select("*");
 * ```
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
