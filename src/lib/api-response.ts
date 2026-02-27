import { NextResponse } from "next/server";

/**
 * 統一 API 回應格式
 *
 * 所有 API route 應使用此工具函式回傳，
 * 確保前端得到一致的 `{ data, error, meta }` 結構。
 *
 * @example
 *   return apiOk({ meetings }, { total: 100, limit: 20, offset: 0 });
 *   return apiError("找不到會議", 404);
 */

export interface ApiMeta {
  /** 總筆數（分頁用） */
  total?: number;
  /** 每頁筆數 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  meta: ApiMeta | null;
}

/** 回傳成功回應 */
export function apiOk<T>(
  data: T,
  meta?: ApiMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data, error: null, meta: meta ?? null },
    { status }
  );
}

/** 回傳錯誤回應 */
export function apiError(
  message: string,
  status = 500
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { data: null, error: message, meta: null },
    { status }
  );
}

/**
 * 從 request 解析分頁參數
 * @returns { limit, offset } — limit 上限 100，預設 50
 */
export function parsePagination(
  searchParams: URLSearchParams
): { limit: number; offset: number } {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 50;

  let limit = parseInt(searchParams.get("limit") ?? "", 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  let offset = parseInt(searchParams.get("offset") ?? "", 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  return { limit, offset };
}
