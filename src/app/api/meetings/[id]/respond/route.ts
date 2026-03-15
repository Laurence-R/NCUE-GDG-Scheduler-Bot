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

    // 驗證每個 slot 的格式
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    for (const slot of available_slots) {
      if (
        typeof slot !== "object" ||
        slot === null ||
        typeof slot.date !== "string" ||
        typeof slot.hour !== "number" ||
        typeof slot.minute !== "number"
      ) {
        return apiError("available_slots 格式錯誤：每個 slot 需包含 date(string), hour(number), minute(number)", 400);
      }
      if (!DATE_RE.test(slot.date) || isNaN(Date.parse(slot.date))) {
        return apiError(`無效的日期格式：${slot.date}`, 400);
      }
      if (slot.hour < 0 || slot.hour > 23 || !Number.isInteger(slot.hour)) {
        return apiError(`hour 需為 0~23 的整數，收到 ${slot.hour}`, 400);
      }
      if (slot.minute !== 0 && slot.minute !== 30) {
        return apiError(`minute 需為 0 或 30，收到 ${slot.minute}`, 400);
      }
    }

    // 確認會議存在
    const { data: meeting } = await supabase
      .from("meetings")
      .select("id, date_range_start, date_range_end")
      .eq("id", meetingId)
      .single();

    if (!meeting) {
      return apiError("找不到會議", 404);
    }

    // 確認使用者在受邀名單中
    const { data: member } = await supabase
      .from("meeting_members")
      .select("id")
      .eq("meeting_id", meetingId)
      .eq("discord_id", sessionUser.id)
      .single();

    if (!member) {
      return apiError("你不在此會議的受邀名單中", 403);
    }

    // 去重 & 過濾超出日期範圍的 slot
    const seen = new Set<string>();
    const validSlots = available_slots.filter((slot: { date: string; hour: number; minute: number }) => {
      const key = `${slot.date}-${slot.hour}-${slot.minute}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return slot.date >= meeting.date_range_start && slot.date <= meeting.date_range_end;
    });

    // Upsert 回覆（同一使用者只能有一筆）
    const upsertData: MeetingResponseInsert = {
      meeting_id: meetingId,
      discord_id: sessionUser.id,
      username: sessionUser.username,
      avatar_hash: sessionUser.avatar ?? null,
      available_slots: validSlots,
    };

    const { data, error } = await supabase
      .from("meeting_responses")
      .upsert(upsertData, { onConflict: "meeting_id,discord_id" })
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }

    // 更新 meeting_members 的 filled_at 時間戳
    await supabase
      .from("meeting_members")
      .update({ filled_at: new Date().toISOString() })
      .eq("meeting_id", meetingId)
      .eq("discord_id", sessionUser.id);

    return apiOk({ response: data });
  } catch {
    return apiError("無效的請求格式", 400);
  }
}
