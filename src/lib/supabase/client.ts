import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Supabase 伺服器端客戶端 (server-only)
 *
 * 優先使用 SUPABASE_SERVICE_ROLE_KEY（繞過 RLS），
 * 若未設定則降級使用 NEXT_PUBLIC_SUPABASE_ANON_KEY。
 *
 * ⚠️ 此模組透過 `server-only` 確保不會被打包進 client bundle。
 */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ 缺少 Supabase 環境變數 (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL 及對應 key)"
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey
);
