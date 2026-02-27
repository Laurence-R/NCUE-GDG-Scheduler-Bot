"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  IconCalendarEvent,
  IconUsers,
  IconClock,
  IconCheck,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import type { Meeting, MeetingResponse, TimeSlot } from "@/lib/supabase/database.types";
import { useUser } from "@/contexts/user-context";

// 時間範圍 8:00 ~ 22:00
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

export default function MeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 text-[#5865f2] animate-spin" />
        </div>
      }
    >
      <MeetingContent />
    </Suspense>
  );
}

function MeetingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = params.id as string;
  const { user } = useUser();

  // 優先從 URL params 取得（OAuth2 callback 剛回來），否則從 cookie session 取得
  const discordId = searchParams.get("discord_id") ?? user?.id ?? "";
  const username = searchParams.get("username") ?? user?.username ?? "";
  const avatarUrl = searchParams.get("avatar") ?? user?.avatar_url ?? "";
  const avatarHash = user?.avatar ?? null;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [responses, setResponses] = useState<MeetingResponse[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMeeting(data.meeting);
        setResponses(data.responses ?? []);

        // 如果使用者已有回覆，載入已選擇的時段
        if (discordId) {
          const existing = data.responses?.find(
            (r: MeetingResponse) => r.discord_id === discordId
          );
          if (existing) {
            const slots = new Set<string>(
              existing.available_slots.map(
                (s: TimeSlot) => `${s.date}-${s.hour}`
              )
            );
            setSelectedSlots(slots);
          }
        }
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeeting();
  }, [meetingId, discordId]);

  const dates = meeting
    ? getDatesInRange(meeting.date_range_start, meeting.date_range_end)
    : [];

  const toggleSlot = useCallback(
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
      setSelectedSlots((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      setSaved(false);
    },
    []
  );

  const handleMouseDown = useCallback(
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour);
    },
    [selectedSlots, toggleSlot]
  );

  const handleMouseEnter = useCallback(
    (date: string, hour: number) => {
      if (!isDragging) return;
      const key = `${date}-${hour}`;
      setSelectedSlots((prev) => {
        const next = new Set(prev);
        if (dragMode === "add") {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
      setSaved(false);
    },
    [isDragging, dragMode]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch event handlers for mobile drag-to-select
  const handleTouchStart = useCallback(
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour);
    },
    [selectedSlots, toggleSlot]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el instanceof HTMLElement) {
        const cellDate = el.dataset.date;
        const cellHour = el.dataset.hour;
        if (cellDate && cellHour) {
          const key = `${cellDate}-${cellHour}`;
          setSelectedSlots((prev) => {
            const next = new Set(prev);
            if (dragMode === "add") {
              next.add(key);
            } else {
              next.delete(key);
            }
            return next;
          });
          setSaved(false);
        }
      }
    },
    [isDragging, dragMode]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSave = async () => {
    if (!discordId || !username) {
      alert("請先透過 Discord OAuth2 登入！");
      return;
    }

    setSaving(true);
    try {
      const available_slots: TimeSlot[] = Array.from(selectedSlots).map(
        (key) => {
          const lastDash = key.lastIndexOf("-");
          const date = key.substring(0, lastDash);
          const hour = parseInt(key.substring(lastDash + 1));
          return { date, hour };
        }
      );

      const res = await fetch(`/api/meetings/${meetingId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discord_id: discordId,
          username,
          avatar_hash: avatarHash,
          available_slots,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "儲存失敗");
      }

      const { response: savedResponse } = await res.json();

      // 即時更新 responses 狀態，使熱力圖與回覆列表立即反映變更
      setResponses((prev) => {
        const exists = prev.findIndex((r) => r.discord_id === discordId);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = savedResponse;
          return updated;
        }
        return [...prev, savedResponse];
      });

      setSaved(true);
      setToast({ message: `已儲存 ${available_slots.length} 個可用時段`, type: "success" });

      // 3 秒後自動重設按鈕狀態
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      setToast({ message: err instanceof Error ? err.message : "儲存失敗，請稍後再試", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 計算每個時段有多少人可用
  const slotCounts = new Map<string, number>();
  responses.forEach((r) => {
    r.available_slots.forEach((s) => {
      const key = `${s.date}-${s.hour}`;
      slotCounts.set(key, (slotCounts.get(key) ?? 0) + 1);
    });
  });
  const maxCount = Math.max(1, ...slotCounts.values());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 text-[#5865f2] animate-spin" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>找不到會議</h2>
          <p style={{ color: "var(--text-muted)" }}>
            此會議 ID 不存在或已被刪除。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10" onMouseUp={handleMouseUp} onTouchEnd={handleTouchEnd}>
      {/* Meeting Header */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 sm:gap-3" style={{ color: "var(--text-primary)" }}>
          <IconCalendarEvent className="h-5 w-5 sm:h-7 sm:w-7 text-[#5865f2] shrink-0" />
          <span className="break-words">{meeting.name}</span>
        </h1>
        {meeting.description && (
          <p className="mb-4" style={{ color: "var(--text-muted)" }}>{meeting.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <IconClock className="h-4 w-4" />
            {meeting.date_range_start} ~ {meeting.date_range_end}
          </span>
          <span className="flex items-center gap-1.5">
            <IconUsers className="h-4 w-4" />
            {responses.length} / {meeting.participants_count} 人已回覆
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--text-faint)" }}>
            {meeting.id}
          </span>
        </div>
      </div>

      {/* Login info */}
      {discordId ? (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="glass-card p-4 flex items-center gap-3" style={{ borderColor: "var(--accent-border-subtle)", background: "var(--accent-bg-subtle)" }}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                width={24}
                height={24}
                className="rounded-full shrink-0 ring-2"
                style={{ boxShadow: "0 0 0 2px var(--accent-ring)" }}
                unoptimized
              />
            ) : (
              <IconCheck className="h-5 w-5 text-[#5865f2]" />
            )}
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              已登入為 <strong style={{ color: "var(--text-primary)" }}>{username}</strong>
              ，點選下方時段標記你的可用時間。
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="glass-card p-4 flex items-center gap-3" style={{ borderColor: "var(--warning-border)", background: "var(--warning-bg)" }}>
            <IconClock className="h-5 w-5" style={{ color: "var(--warning-text)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              你目前是以訪客身分瀏覽。如需填寫時段，請透過 Discord 指令中的按鈕登入。
            </span>
          </div>
        </div>
      )}

      {/* When2Meet Grid */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="glass-card p-3 sm:p-6 overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-2xl">
          <div
            className="select-none min-w-fit"
            style={{ userSelect: "none" }}
            onTouchMove={handleTouchMove}
          >
            {/* Header row with dates */}
            <div className="flex">
              <div className="w-10 sm:w-16 shrink-0" /> {/* spacer for time labels */}
              {dates.map((date) => (
                <div
                  key={date}
                  className="flex-1 min-w-[40px] sm:min-w-[60px] text-center text-[10px] sm:text-xs font-medium pb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <div>{formatWeekday(date)}</div>
                  <div style={{ color: "var(--text-faint)" }}>{formatShortDate(date)}</div>
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="flex">
                <div className="w-10 sm:w-16 shrink-0 text-right pr-1 sm:pr-3 text-[10px] sm:text-xs leading-[28px] sm:leading-[32px]" style={{ color: "var(--text-faint)" }}>
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {dates.map((date) => {
                  const key = `${date}-${hour}`;
                  const isSelected = selectedSlots.has(key);
                  const count = slotCounts.get(key) ?? 0;
                  const heatOpacity = count > 0 ? 0.2 + (count / maxCount) * 0.6 : 0;

                  return (
                    <div
                      key={key}
                      data-date={date}
                      data-hour={hour}
                      className={`flex-1 min-w-[40px] sm:min-w-[60px] h-7 sm:h-8 time-grid-cell rounded-sm m-[1px] flex items-center justify-center text-[9px] sm:text-[10px] ${
                        isSelected
                          ? "selected text-white font-medium"
                          : ""
                      }`}
                      style={
                        !isSelected && count > 0
                          ? {
                              background: `rgba(var(--grid-heat-color), ${heatOpacity})`,
                              borderColor: `rgba(var(--grid-heat-color), ${heatOpacity * 0.5})`,
                            }
                          : undefined
                      }
                      onMouseDown={() => handleMouseDown(date, hour)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleTouchStart(date, hour);
                      }}
                    >
                      {count > 0 && !isSelected && (
                        <span style={{ color: "var(--heat-text)" }}>{count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Save */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm" style={{ background: "var(--grid-selected-bg)", border: "1px solid var(--accent-border-subtle)" }} />
            <span>你的選擇</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm" style={{ background: "rgba(var(--grid-heat-color), 0.4)", border: "1px solid rgba(var(--grid-heat-color), 0.2)" }} />
            <span>其他人可用</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm" style={{ border: "1px solid var(--grid-cell-border)", background: "var(--grid-cell-bg, transparent)" }} />
            <span>無人選擇</span>
          </div>
        </div>

        {discordId && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white font-semibold transition-all hover:scale-[1.02]"
          >
            {saving ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <IconCheck className="h-4 w-4" />
            ) : null}
            {saving ? "儲存中..." : saved ? "已儲存" : "儲存可用時段"}
          </button>
        )}
      </div>

      {/* Responses summary */}
      {responses.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            已回覆的成員 ({responses.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {responses.map((r) => {
              const respAvatarUrl = getResponseAvatarUrl(r.discord_id, r.avatar_hash);
              return (
                <div
                  key={r.id}
                  className="glass-card px-3 py-1.5 text-sm flex items-center gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Image
                    src={respAvatarUrl}
                    alt={r.username}
                    width={22}
                    height={22}
                    className="rounded-full shrink-0"
                    unoptimized
                  />
                  <span>{r.username}</span>
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                    {r.available_slots.length} 個時段
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-toast-in"
          style={{
            background: toast.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
            borderColor: toast.type === "success" ? "var(--success-border)" : "var(--danger-border)",
            color: toast.type === "success" ? "var(--success-text-strong)" : "var(--danger-text)",
          }}
        >
          {toast.type === "success" ? (
            <IconCheck className="h-4 w-4 shrink-0" />
          ) : (
            <IconX className="h-4 w-4 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/** 從 discord_id 和 avatar_hash 產生頭像 URL */
function getResponseAvatarUrl(discordId: string, avatarHash: string | null | undefined): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}`;
  }
  const index = Number(BigInt(discordId) >> BigInt(22)) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

/** 取得日期範圍內的所有日期 */
function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatWeekday(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return days[new Date(dateStr).getDay()];
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
