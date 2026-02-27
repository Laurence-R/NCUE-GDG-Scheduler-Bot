import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { apiOk, apiError, parsePagination } from "@/lib/api-response";
import type { MeetingInsert } from "@/lib/supabase/database.types";

/**
 * GET /api/meetings — 取得會議列表（需登入，支援分頁）
 *
 * Query params:
 *   discord_id  — 篩選特定使用者建立的會議
 *   limit       — 每頁筆數（預設 50，上限 100）
 *   offset      — 偏移量（預設 0）
 */
export async function GET(request: NextRequest) {
  // 要求登入，未登入回傳 401
  const result = await requireSession();
  if (result instanceof NextResponse) return result;

  const searchParams = request.nextUrl.searchParams;
  const discordId = searchParams.get("discord_id");
  const { limit, offset } = parsePagination(searchParams);

  let query = supabase
    .from("meetings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // 若有指定 discord_id，僅取得該使用者建立的會議
  if (discordId) {
    query = query.eq("creator_discord_id", discordId);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError(error.message, 500);
  }

  const response = apiOk(
    { meetings: data ?? [] },
    { total: count ?? 0, limit, offset }
  );

  // 短暫快取 + stale-while-revalidate 減少重複請求
  response.headers.set(
    "Cache-Control",
    "private, max-age=30, stale-while-revalidate=60"
  );

  return response;
}

/**
 * POST /api/meetings — 建立新會議（需登入）
 *
 * 注意：Discord Interaction 建立會議走的是
 * `handlers/modal-submit.ts` → 直接使用 Supabase，不經過此端點。
 */
export async function POST(request: NextRequest) {
  // 要求登入，未登入回傳 401
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();

    const {
      id,
      name,
      description,
      participants_count,
      date_range_start,
      date_range_end,
      guild_id,
      channel_id,
    } = body;

    if (!id || !name || !date_range_start || !date_range_end) {
      return apiError("缺少必要欄位", 400);
    }

    // 從 session 取得建立者身分，不信任 request body
    const insertData: MeetingInsert = {
      id,
      name,
      description: description || null,
      participants_count: participants_count || 0,
      date_range_start,
      date_range_end,
      creator_discord_id: session.id,
      creator_username: session.username,
      guild_id: guild_id || null,
      channel_id: channel_id || null,
    };

    const { data, error } = await supabase
      .from("meetings")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }

    return apiOk({ meeting: data }, undefined, 201);
  } catch {
    return apiError("無效的請求格式", 400);
  }
}
