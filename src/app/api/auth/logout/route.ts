import { clearSessionUser } from "@/lib/auth";
import { apiOk } from "@/lib/api-response";

/**
 * POST /api/auth/logout
 * 清除使用者 Session Cookie
 */
export async function POST() {
  await clearSessionUser();
  return apiOk({ success: true });
}
