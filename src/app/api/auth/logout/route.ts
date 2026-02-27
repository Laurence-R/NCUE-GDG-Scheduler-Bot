import { NextResponse } from "next/server";
import { clearSessionUser } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * 清除使用者 Session Cookie
 */
export async function POST() {
  await clearSessionUser();
  return NextResponse.json({ success: true });
}
