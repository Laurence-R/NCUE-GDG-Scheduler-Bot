"use client";

import { useCallback, useEffect, useState } from "react";
import type { Meeting } from "@/lib/supabase/database.types";

/**
 * 共用會議列表 Hook
 *
 * 消除 Dashboard 與 Meetings 頁面的重複 fetch 邏輯。
 * 自動在 mount 時載入，並提供 `refresh()` 手動重新載入。
 */
export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meetings");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setMeetings(json.data?.meetings ?? []);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      setError("無法載入會議資料，請檢查網路連線後重試。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refresh: fetchMeetings };
}
