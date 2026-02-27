import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import { apiOk, apiError } from "@/lib/api-response";
import type { MeetingResponseInsert } from "@/lib/supabase/database.types";

/**
 * POST /api/meetings/[id]/respond — 提交或更新可用時段
 * 身分從 server-side session cookie 取得，防止偽造
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;

  // 從 httpOnly cookie 取得登入使用者，不信任 request body
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return apiError("請先登入 Discord", 401);
  }

  try {
    const body = await request.json();
    const { available_slots } = body;

    if (!Array.isArray(available_slots)) {
      return apiError("缺少必要欄位（available_slots）", 400);
    }

    // 確認會議存在
    const { data: meeting } = await supabase
      .from("meetings")
      .select("id")
      .eq("id", meetingId)
      .single();

    if (!meeting) {
      return apiError("找不到會議", 404);
    }

    // Upsert 回覆（同一使用者只能有一筆）
    const upsertData: MeetingResponseInsert = {
      meeting_id: meetingId,
      discord_id: sessionUser.id,
      username: sessionUser.username,
      avatar_hash: sessionUser.avatar ?? null,
      available_slots,
    };

    const { data, error } = await supabase
      .from("meeting_responses")
      .upsert(upsertData, { onConflict: "meeting_id,discord_id" })
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }

    return apiOk({ response: data });
  } catch {
    return apiError("無效的請求格式", 400);
  }
}
