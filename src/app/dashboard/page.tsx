"use client";

import { Suspense, useEffect, useState } from "react";
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
} from "@tabler/icons-react";
import type { Meeting } from "@/lib/supabase/database.types";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 text-[#5865f2] animate-spin" />
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

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch("/api/meetings");
        const data = await res.json();
        setMeetings(data.meetings ?? []);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const now = new Date();
  const currentMeetings = meetings.filter(
    (m) => new Date(m.date_range_end) >= now
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.date_range_end) < now
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      {/* Login success banner */}
      {loginSuccess && (
        <div className="max-w-3xl mx-auto mb-6">
          <div
            className="glass-card p-4 flex items-center gap-3"
            style={{ borderColor: "var(--success-border)", background: "var(--success-bg)" }}
          >
            <IconCheck className="h-5 w-5" style={{ color: "var(--success-text)" }} />
            <span className="text-sm" style={{ color: "var(--success-text-strong)" }}>
              已成功透過 Discord 登入！
            </span>
          </div>
        </div>
      )}

      {/* Header — 精簡 */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          儀表板
        </h1>
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          共 {meetings.length} 場會議 · {currentMeetings.length} 場進行中
        </p>
      </div>

      {/* Stats — 水平指標列 */}
      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 mb-8">
        <div className="glass-card p-4 text-center cursor-pointer">
          <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {currentMeetings.length}
          </span>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>進行中</p>
        </div>
        <div className="glass-card p-4 text-center cursor-pointer">
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {meetings.length}
          </span>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>總會議</p>
        </div>
        <div className="glass-card p-4 text-center cursor-pointer">
          <span className="text-2xl font-bold" style={{ color: "var(--text-muted)" }}>
            {pastMeetings.length}
          </span>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>已結束</p>
        </div>
      </div>

      {/* Current Meetings */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
            進行中
          </h2>
          <span className="text-xs tabular-nums" style={{ color: "var(--text-faint)" }}>
            {currentMeetings.length} 場
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="glass-card p-5 animate-pulse"
              >
                <div className="h-4 rounded w-1/3 mb-3" style={{ background: "var(--surface-hover)" }} />
                <div className="h-3 rounded w-2/3" style={{ background: "var(--surface-hover)" }} />
              </div>
            ))}
          </div>
        ) : currentMeetings.length === 0 ? (
          <div className="glass-card p-8 sm:p-10 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-hover)" }}
            >
              <IconPlus className="h-5 w-5" style={{ color: "var(--text-faint)" }} />
            </div>
            <p className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              還沒有進行中的會議
            </p>
            <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
              在 Discord 頻道中使用{" "}
              <code
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
              >
                /scheduler meeting
              </code>{" "}
              建立第一場。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
              已結束
            </h2>
            <span className="text-xs tabular-nums" style={{ color: "var(--text-faint)" }}>
              {pastMeetings.length} 場
            </span>
          </div>
          <div className="space-y-3">
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
      className={`group glass-card meeting-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
        past ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="font-semibold text-base truncate" style={{ color: "var(--text-primary)" }}>
            {meeting.name}
          </h3>
          {!past && daysLeft <= 2 && (
            <span
              className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full"
              style={{
                background: daysLeft <= 0 ? "var(--danger-bg)" : "var(--warning-bg)",
                color: daysLeft <= 0 ? "var(--danger-text)" : "var(--warning-text)",
                border: `1px solid ${daysLeft <= 0 ? "var(--danger-border)" : "var(--warning-border)"}`,
              }}
            >
              {daysLeft <= 0 ? "今日截止" : `剩 ${daysLeft} 天`}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <IconCalendarEvent className="h-3.5 w-3.5 shrink-0" />
            {meeting.date_range_start} ~ {meeting.date_range_end}
          </span>
          <span className="flex items-center gap-1.5">
            <IconUsers className="h-3.5 w-3.5 shrink-0" />
            {meeting.participants_count} 人
          </span>
        </div>
      </div>
      {!past && (
        <div
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "var(--accent)" }}
        >
          開啟
          <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      )}
    </a>
  );
}
