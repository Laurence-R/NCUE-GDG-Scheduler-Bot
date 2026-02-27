import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { apiOk, apiError } from "@/lib/api-response";

/**
 * GET /api/meetings/[id] — 取得單一會議詳情（含回覆）
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (meetingError || !meeting) {
    return apiError("找不到會議", 404);
  }

  const { data: responses, error: responsesError } = await supabase
    .from("meeting_responses")
    .select("*")
    .eq("meeting_id", id);

  if (responsesError) {
    return apiError(responsesError.message, 500);
  }

  return apiOk({
    meeting,
    responses: responses ?? [],
  });
}
