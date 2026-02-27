import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { MeetingResponseInsert } from "@/lib/supabase/database.types";

/**
 * POST /api/meetings/[id]/respond — 提交或更新可用時段
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;

  try {
    const body = await request.json();
    const { discord_id, username, avatar_hash, available_slots } = body;

    if (!discord_id || !username || !Array.isArray(available_slots)) {
      return NextResponse.json(
        { error: "缺少必要欄位（discord_id, username, available_slots）" },
        { status: 400 }
      );
    }

    // 確認會議存在
    const { data: meeting } = await supabase
      .from("meetings")
      .select("id")
      .eq("id", meetingId)
      .single();

    if (!meeting) {
      return NextResponse.json(
        { error: "找不到會議" },
        { status: 404 }
      );
    }

    // Upsert 回覆（同一使用者只能有一筆）
    const upsertData: MeetingResponseInsert = {
      meeting_id: meetingId,
      discord_id,
      username,
      avatar_hash: avatar_hash ?? null,
      available_slots,
    };

    const { data, error } = await supabase
      .from("meeting_responses")
      .upsert(upsertData as never, { onConflict: "meeting_id,discord_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ response: data });
  } catch {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }
}
