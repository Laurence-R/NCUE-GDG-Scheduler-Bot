"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IconCalendarEvent,
  IconExternalLink,
  IconLoader2,
  IconSearch,
  IconUsers,
  IconUser,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/supabase/database.types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meetings");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMeetings(data.meetings ?? []);
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

  const filtered = meetings.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("min-h-screen p-4 sm:p-6 md:p-10")}>
      <div className={cn("max-w-4xl mx-auto")}>
        {/* Header */}
        <div className={cn("mb-8")}>
          <h1 className={cn("text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3 text-text-primary")}>
            <IconCalendarEvent className={cn("h-6 w-6 sm:h-7 sm:w-7 text-accent")} />
            所有會議
          </h1>
          <p className={cn("text-text-muted")}>
            瀏覽所有已建立的會議排程。
          </p>
        </div>

        {/* Search */}
        <div className={cn("glass-card p-3 mb-6 flex items-center gap-3")}>
          <IconSearch className={cn("h-5 w-5 shrink-0 text-text-faint")} />
          <input
            type="text"
            placeholder="搜尋會議名稱或 ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn("flex-1 outline-none text-sm bg-transparent text-input")}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className={cn("glass-card p-4 mb-6 flex items-center justify-between gap-3 border-danger-border bg-danger-bg")}>
            <div className={cn("flex items-center gap-3")}>
              <IconAlertTriangle className={cn("h-5 w-5 shrink-0 text-danger")} />
              <span className={cn("text-sm text-danger")}>{error}</span>
            </div>
            <button
              onClick={fetchMeetings}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-accent hover:bg-accent-bg-subtle")}
            >
              <IconRefresh className={cn("h-3.5 w-3.5")} />
              重試
            </button>
          </div>
        )}

        {/* Meeting list */}
        {loading ? (
          <div className={cn("flex items-center justify-center py-20")}>
            <IconLoader2 className={cn("h-8 w-8 text-accent animate-spin")} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn("glass-card p-8 text-center")}>
            <p className={cn("text-text-muted")}>
              {search ? "找不到符合的會議。" : "目前沒有任何會議。"}
            </p>
          </div>
        ) : (
          <div className={cn("space-y-3")}>
            {filtered.map((meeting) => {
              const isActive = new Date(meeting.date_range_end) >= new Date();

              return (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className={cn(
                    "glass-card meeting-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 block",
                    !isActive && "opacity-60"
                  )}
                >
                  <div>
                    <div className={cn("flex items-center gap-2 mb-1")}>
                      <h3 className={cn("font-semibold text-base text-text-primary")}>
                        {meeting.name}
                      </h3>
                      {isActive && (
                        <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full bg-success-bg-medium text-success border border-success-border")}>
                          進行中
                        </span>
                      )}
                    </div>
                    <div className={cn("flex flex-wrap items-center gap-3 text-sm text-text-secondary")}>
                      <span className={cn("flex items-center gap-1")}>
                        <IconCalendarEvent className={cn("h-3.5 w-3.5 text-accent")} />
                        {meeting.date_range_start} ~{" "}
                        {meeting.date_range_end}
                      </span>
                      <span className={cn("flex items-center gap-1")}><IconUsers className={cn("h-3.5 w-3.5 text-accent")} /> {meeting.participants_count} 人</span>
                      <span className={cn("flex items-center gap-1")}><IconUser className={cn("h-3.5 w-3.5 text-accent")} /> {meeting.creator_username}</span>
                    </div>
                  </div>
                  <IconExternalLink className={cn("h-5 w-5 shrink-0 text-text-faint")} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
