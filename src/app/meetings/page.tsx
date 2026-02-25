"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconCalendarEvent,
  IconExternalLink,
  IconLoader2,
  IconSearch,
  IconUsers,
  IconUser,
} from "@tabler/icons-react";
import type { Meeting } from "@/lib/supabase/database.types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = meetings.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <IconCalendarEvent className="h-6 w-6 sm:h-7 sm:w-7 text-[#5865f2]" />
            所有會議
          </h1>
          <p className="text-neutral-400">
            瀏覽所有已建立的會議排程。
          </p>
        </div>

        {/* Search */}
        <div className="glass-card p-3 mb-6 flex items-center gap-3">
          <IconSearch className="h-5 w-5 text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="搜尋會議名稱或 ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none text-sm"
          />
        </div>

        {/* Meeting list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-8 w-8 text-[#5865f2] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-neutral-400">
              {search ? "找不到符合的會議。" : "目前沒有任何會議。"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((meeting) => {
              const isActive = new Date(meeting.date_range_end) >= new Date();

              return (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className={`glass-card meeting-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 block ${
                    !isActive ? "opacity-60" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-base">
                        {meeting.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          進行中
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
                      <span className="flex items-center gap-1">
                        <IconCalendarEvent className="h-3.5 w-3.5 text-[#5865f2]" />
                        {meeting.date_range_start} ~{" "}
                        {meeting.date_range_end}
                      </span>
                      <span className="flex items-center gap-1"><IconUsers className="h-3.5 w-3.5 text-[#5865f2]" /> {meeting.participants_count} 人</span>
                      <span className="flex items-center gap-1"><IconUser className="h-3.5 w-3.5 text-[#5865f2]" /> {meeting.creator_username}</span>
                    </div>
                  </div>
                  <IconExternalLink className="h-5 w-5 text-neutral-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
