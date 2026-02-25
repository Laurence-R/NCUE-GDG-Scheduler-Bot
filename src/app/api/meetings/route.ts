import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { MeetingInsert } from "@/lib/supabase/database.types";

/**
 * GET /api/meetings — 取得所有會議列表
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const discordId = searchParams.get("discord_id");

  let query = supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false });

  // 若有指定 discord_id，僅取得該使用者建立的會議
  if (discordId) {
    query = query.eq("creator_discord_id", discordId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meetings: data });
}

/**
 * POST /api/meetings — 建立新會議
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      description,
      participants_count,
      date_range_start,
      date_range_end,
      creator_discord_id,
      creator_username,
      guild_id,
      channel_id,
    } = body;

    if (!id || !name || !date_range_start || !date_range_end || !creator_discord_id || !creator_username) {
      return NextResponse.json(
        { error: "缺少必要欄位" },
        { status: 400 }
      );
    }

    const insertData: MeetingInsert = {
      id,
      name,
      description: description || null,
      participants_count: participants_count || 0,
      date_range_start,
      date_range_end,
      creator_discord_id,
      creator_username,
      guild_id: guild_id || null,
      channel_id: channel_id || null,
    };

    const { data, error } = await supabase
      .from("meetings")
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }
}
