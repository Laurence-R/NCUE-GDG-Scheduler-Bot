"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconCalendarEvent,
  IconExternalLink,
  IconLoader2,
  IconSearch,
  IconUsers,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useMeetings } from "@/hooks/use-meetings";
import { ErrorBanner } from "@/components/ui/error-banner";
import { AuthGuard } from "@/components/auth-guard";
import type { Meeting } from "@/lib/supabase/database.types";

/** 角色篩選標籤（value 用於比對 meeting.role_name） */
const ROLE_TABS = [
  { label: "全部", value: null },
  { label: "@everyone", value: "everyone" },
  { label: "@Lead", value: "lead" },
  { label: "@開發組", value: "開發組" },
  { label: "@教學組", value: "教學組" },
  { label: "@行政組", value: "行政組" },
] as const;

export default function MeetingsPage() {
  const { meetings, loading, error, refresh: fetchMeetings } = useMeetings();
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // 計算每個角色有多少會議（用於隱藏無會議的標籤）
  const roleCounts = useMemo(() => {
    const counts = new Map<string | null, number>();
    counts.set(null, meetings.length);
    for (const tab of ROLE_TABS) {
      if (tab.value === null) continue;
      counts.set(
        tab.value,
        meetings.filter(
          (m) => m.role_name?.toLowerCase() === tab.value!.toLowerCase()
        ).length
      );
    }
    return counts;
  }, [meetings]);

  const filtered = useMemo(() => {
    let list = meetings;

    // 角色篩選
    if (activeRole !== null) {
      list = list.filter(
        (m) => m.role_name?.toLowerCase() === activeRole.toLowerCase()
      );
    }

    // 關鍵字搜尋
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [meetings, activeRole, search]);

  return (
    <AuthGuard pageName="會議排程">
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

        {/* Role filter tabs */}
        <div className={cn("flex flex-wrap gap-2 mb-4")}>
          {ROLE_TABS.map((tab) => {
            const count = roleCounts.get(tab.value) ?? 0;
            // 隱藏沒有任何會議的角色標籤（「全部」始終顯示）
            if (tab.value !== null && count === 0) return null;
            const isActive = activeRole === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveRole(tab.value)}
                className={cn(
                  "px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "glass-card text-text-muted hover:text-text-primary"
                )}
              >
                {tab.label}
                {tab.value !== null && (
                  <span className={cn("ml-1.5 opacity-70")}>{count}</span>
                )}
              </button>
            );
          })}
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
          <ErrorBanner message={error} onRetry={fetchMeetings} className="mb-6" />
        )}

        {/* Meeting list */}
        {loading ? (
          <div className={cn("flex items-center justify-center py-20")}>
            <IconLoader2 className={cn("h-8 w-8 text-accent animate-spin")} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn("glass-card p-8 text-center")}>
            <p className={cn("text-text-muted")}>
              {search || activeRole ? "找不到符合的會議。" : "目前沒有任何會議。"}
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
                      {meeting.role_name && (
                        <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-bg-medium text-accent border border-accent-border-subtle")}>
                          @{meeting.role_name}
                        </span>
                      )}
                    </div>
                    <div className={cn("flex flex-wrap items-center gap-3 text-sm text-text-secondary")}>
                      <span className={cn("flex items-center gap-1")}>
                        <IconCalendarEvent className={cn("h-3.5 w-3.5 text-accent")} />
                        {meeting.date_range_start} ~{" "}
                        {meeting.date_range_end}
                      </span>
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
    </AuthGuard>
  );
}
