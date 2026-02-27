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
        <div className="max-w-4xl mx-auto mb-6">
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

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>儀表板</h1>
        <p style={{ color: "var(--text-muted)" }}>
          管理你的會議排程，查看歷史紀錄。
        </p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-bg-medium)" }}>
              <IconCalendarEvent className="h-4 w-4 text-[#5865f2]" />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>進行中會議</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {currentMeetings.length}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--success-bg-medium)" }}>
              <IconUsers className="h-4 w-4" style={{ color: "var(--success-text)" }} />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>總會議數</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {meetings.length}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--warning-bg-medium)" }}>
              <IconClock className="h-4 w-4" style={{ color: "var(--warning-text)" }} />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>已結束</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {pastMeetings.length}
          </span>
        </div>
      </div>

      {/* Current Meetings */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <IconCalendarEvent className="h-5 w-5 text-[#5865f2]" />
          進行中的會議
        </h2>

        {loading ? (
          <div className="glass-card p-8 text-center" style={{ color: "var(--text-muted)" }}>
            載入中...
          </div>
        ) : currentMeetings.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              目前沒有進行中的會議。
            </p>
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>
              在 Discord 中使用{" "}
              <code
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
              >
                /scheduler meeting
              </code>{" "}
              來建立新的會議排程。
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <IconClock className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
            歷史會議
          </h2>
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
  return (
    <div
      className={`glass-card meeting-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        past ? "opacity-70" : ""
      }`}
    >
      <div>
        <h3 className="font-semibold text-base mb-1" style={{ color: "var(--text-primary)" }}>{meeting.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1">
            <IconCalendarEvent className="h-3.5 w-3.5 text-[#5865f2]" />
            {meeting.date_range_start} ~ {meeting.date_range_end}
          </span>
          <span className="flex items-center gap-1"><IconUsers className="h-3.5 w-3.5 text-[#5865f2]" /> {meeting.participants_count} 人</span>
          <span className="font-mono text-xs" style={{ color: "var(--text-faint)" }}>
            {meeting.id}
          </span>
        </div>
      </div>
      {!past && (
        <a
          href={`/meeting/${meeting.id}`}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium transition-colors"
        >
          <IconExternalLink className="h-4 w-4" />
          開啟
        </a>
      )}
    </div>
  );
}
