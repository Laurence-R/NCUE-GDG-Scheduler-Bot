"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconCalendarEvent,
  IconUsers,
  IconClock,
  IconExternalLink,
  IconCheck,
  IconLoader2,
  IconPlus,
  IconBrandDiscord,
  IconArrowRight,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/supabase/database.types";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className={cn("min-h-screen flex items-center justify-center")}>
          <IconLoader2 className={cn("h-8 w-8 text-accent animate-spin")} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const loginSuccess = searchParams.get("login") === "success";
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
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

  const now = new Date();
  const currentMeetings = meetings.filter(
    (m) => new Date(m.date_range_end) >= now
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.date_range_end) < now
  );

  return (
    <div className={cn("min-h-screen p-4 sm:p-6 md:p-10")}>
      {/* Login success banner */}
      {loginSuccess && (
        <div className={cn("max-w-3xl mx-auto mb-6")}>
          <div className={cn("glass-card p-4 flex items-center gap-3 border-success-border bg-success-bg")}>
            <IconCheck className={cn("h-5 w-5 text-success")} />
            <span className={cn("text-sm text-success-strong")}>
              已成功透過 Discord 登入！
            </span>
          </div>
        </div>
      )}

      {/* Header — 精簡 */}
      <div className={cn("max-w-3xl mx-auto mb-8")}>
        <h1 className={cn("text-2xl sm:text-3xl font-bold mb-1 text-text-primary")}>
          儀表板
        </h1>
        <p className={cn("text-sm text-text-faint")}>
          共 {meetings.length} 場會議 · {currentMeetings.length} 場進行中
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className={cn("max-w-3xl mx-auto mb-6")}>
          <div className={cn("glass-card p-4 flex items-center justify-between gap-3 border-danger-border bg-danger-bg")}>
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
        </div>
      )}

      {/* Stats — 水平指標列 */}
      <div className={cn("max-w-3xl mx-auto grid grid-cols-3 gap-3 mb-8")}>
        <div className={cn("glass-card p-4 text-center cursor-pointer")}>
          <span className={cn("text-2xl font-bold text-accent")}>
            {currentMeetings.length}
          </span>
          <p className={cn("text-xs mt-1 text-text-faint")}>進行中</p>
        </div>
        <div className={cn("glass-card p-4 text-center cursor-pointer")}>
          <span className={cn("text-2xl font-bold text-text-primary")}>
            {meetings.length}
          </span>
          <p className={cn("text-xs mt-1 text-text-faint")}>總會議</p>
        </div>
        <div className={cn("glass-card p-4 text-center cursor-pointer")}>
          <span className={cn("text-2xl font-bold text-text-muted")}>
            {pastMeetings.length}
          </span>
          <p className={cn("text-xs mt-1 text-text-faint")}>已結束</p>
        </div>
      </div>

      {/* Current Meetings */}
      <div className={cn("max-w-3xl mx-auto mb-10")}>
        <div className={cn("flex items-center justify-between mb-4")}>
          <h2 className={cn("text-sm font-semibold uppercase tracking-widest text-text-faint")}>
            進行中
          </h2>
          <span className={cn("text-xs tabular-nums text-text-faint")}>
            {currentMeetings.length} 場
          </span>
        </div>

        {loading ? (
          <div className={cn("space-y-3")}>
            {[1, 2].map((i) => (
              <div key={i} className={cn("glass-card p-5 animate-pulse")}>
                <div className={cn("h-4 rounded w-1/3 mb-3 bg-surface-hover")} />
                <div className={cn("h-3 rounded w-2/3 bg-surface-hover")} />
              </div>
            ))}
          </div>
        ) : currentMeetings.length === 0 ? (
          <div className={cn("glass-card p-8 sm:p-10 text-center")}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-surface-hover")}>
              <IconPlus className={cn("h-5 w-5 text-text-faint")} />
            </div>
            <p className={cn("font-medium mb-2 text-text-primary")}>
              還沒有進行中的會議
            </p>
            <p className={cn("text-sm mb-5 max-w-xs mx-auto text-text-muted")}>
              在 Discord 頻道中使用{" "}
              <code className={cn("px-1.5 py-0.5 rounded text-xs font-mono bg-code-bg text-code")}>
                /scheduler meeting
              </code>{" "}
              建立第一場。
            </p>
          </div>
        ) : (
          <div className={cn("space-y-3")}>
            {currentMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className={cn("max-w-3xl mx-auto")}>
          <div className={cn("flex items-center justify-between mb-4")}>
            <h2 className={cn("text-sm font-semibold uppercase tracking-widest text-text-faint")}>
              已結束
            </h2>
            <span className={cn("text-xs tabular-nums text-text-faint")}>
              {pastMeetings.length} 場
            </span>
          </div>
          <div className={cn("space-y-3")}>
            {pastMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} past />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({
  meeting,
  past = false,
}: {
  meeting: Meeting;
  past?: boolean;
}) {
  const daysLeft = Math.ceil(
    (new Date(meeting.date_range_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <a
      href={`/meeting/${meeting.id}`}
      className={cn(
        "group glass-card meeting-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer",
        past && "opacity-60"
      )}
    >
      <div className={cn("min-w-0")}>
        <div className={cn("flex items-center gap-2 mb-1.5")}>
          <h3 className={cn("font-semibold text-base truncate text-text-primary")}>
            {meeting.name}
          </h3>
          {!past && daysLeft <= 2 && (
            <span
              className={cn(
                "shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border",
                daysLeft <= 0
                  ? "bg-danger-bg text-danger border-danger-border"
                  : "bg-warning-bg text-warning border-warning-border"
              )}
            >
              {daysLeft <= 0 ? "今日截止" : `剩 ${daysLeft} 天`}
            </span>
          )}
        </div>
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted")}>
          <span className={cn("flex items-center gap-1.5")}>
            <IconCalendarEvent className={cn("h-3.5 w-3.5 shrink-0")} />
            {meeting.date_range_start} ~ {meeting.date_range_end}
          </span>
          <span className={cn("flex items-center gap-1.5")}>
            <IconUsers className={cn("h-3.5 w-3.5 shrink-0")} />
            {meeting.participants_count} 人
          </span>
        </div>
      </div>
      {!past && (
        <div className={cn("shrink-0 flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 text-accent")}>
          開啟
          <IconArrowRight className={cn("h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5")} />
        </div>
      )}
    </a>
  );
}
