"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { IconLoader2, IconLock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import type { TimeSlot } from "@/lib/supabase/database.types";
import { useMeetingData } from "../_hooks/use-meeting-data";
import { useTimeGrid } from "../_hooks/use-time-grid";
import { useToast } from "../_hooks/use-toast";
import { getDatesInRange, slotKey, parseSlotKey, TIME_BLOCKS } from "../_utils/date-helpers";
import { MeetingHeader } from "./meeting-header";
import { LoginStatus } from "./login-status";
import { TimeGrid } from "./time-grid";
import { GridLegend } from "./grid-legend";
import { SaveButton } from "./save-button";
import { ResponsesSummary } from "./responses-summary";
import { ToastNotification } from "./toast-notification";

export function MeetingContent() {
  const params = useParams();
  const meetingId = params.id as string;
  const { user, loading: userLoading } = useUser();

  // 身分統一從 UserContext 取得（server-side session cookie → /api/auth/me）
  const discordId = user?.id ?? "";
  const username = user?.username ?? "";
  const avatarUrl = user?.avatar_url ?? "";

  const { meeting, responses, setResponses, members, selectedSlots, setSelectedSlots, loading } =
    useMeetingData(meetingId, discordId);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const onSlotChange = useCallback(() => setSaved(false), []);

  const {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTimeGrid(selectedSlots, setSelectedSlots, onSlotChange);

  const dates = meeting
    ? getDatesInRange(meeting.date_range_start, meeting.date_range_end)
    : [];

  // 存取控制：有成員快照時，僅快照內成員可互動
  const isMember = !discordId || members.length === 0 || members.some((m) => m.discord_id === discordId);
  const canInteract = !!discordId && isMember;

  // 計算每個時段有多少「其他人」可用（排除自己的舊回覆）
  const { slotCounts, maxCount, organizerSlots } = useMemo(() => {
    const counts = new Map<string, number>();
    const orgSlots = new Set<string>();

    // 找出發起人 discord_id
    const organizer = members.find((m) => m.is_organizer);
    const organizerId = organizer?.discord_id ?? null;

    responses.forEach((r) => {
      // 收集發起人的可用時段
      if (organizerId && r.discord_id === organizerId) {
        r.available_slots.forEach((s) => {
          orgSlots.add(slotKey(s.date, s.hour, s.minute ?? 0));
        });
      }
      if (r.discord_id === discordId) return;
      r.available_slots.forEach((s) => {
        const key = slotKey(s.date, s.hour, s.minute ?? 0);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    const othersMax = counts.size > 0 ? Math.max(...counts.values()) : 0;
    const max = Math.max(1, othersMax + (discordId ? 1 : 0));
    return { slotCounts: counts, maxCount: max, organizerSlots: orgSlots };
  }, [responses, members, discordId]);

  // 計算「符合會議時長」的有效連續區間（灰顯零散時段用）
  const viableSlots = useMemo(() => {
    const durationMinutes = meeting?.duration_minutes ?? 60;
    const blocksNeeded = Math.ceil(durationMinutes / 30);
    const viable = new Set<string>();

    for (const date of dates) {
      const blocks = TIME_BLOCKS.map((b) => {
        const key = slotKey(date, b.hour, b.minute);
        const othersCount = slotCounts.get(key) ?? 0;
        const selfSelected = selectedSlots.has(key) ? 1 : 0;
        return { key, total: othersCount + selfSelected };
      });

      for (let i = 0; i <= blocks.length - blocksNeeded; i++) {
        let allAvailable = true;
        for (let j = i; j < i + blocksNeeded; j++) {
          if (blocks[j].total === 0) { allAvailable = false; break; }
        }
        if (allAvailable) {
          for (let j = i; j < i + blocksNeeded; j++) {
            viable.add(blocks[j].key);
          }
        }
      }
    }
    return viable;
  }, [meeting?.duration_minutes, dates, slotCounts, selectedSlots]);

  const handleSave = async () => {
    if (!discordId || !username) {
      alert("請先透過 Discord OAuth2 登入！");
      return;
    }

    setSaving(true);
    try {
      const available_slots: TimeSlot[] = Array.from(selectedSlots).map(
        (key) => {
          const parsed = parseSlotKey(key);
          return { date: parsed.date, hour: parsed.hour, minute: parsed.minute };
        }
      );

      // 身分由 server-side session 自動取得，只需送時段資料
      const res = await fetch(`/api/meetings/${meetingId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available_slots }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "儲存失敗");
      }

      const json = await res.json();
      const savedResponse = json.data?.response;

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
      showToast({
        message: `已儲存 ${available_slots.length} 個可用時段`,
        type: "success",
      });

      // 3 秒後自動重設按鈕狀態
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      showToast({
        message: err instanceof Error ? err.message : "儲存失敗，請稍後再試",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center")}>
        <IconLoader2 className={cn("h-8 w-8 text-accent animate-spin")} />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center")}>
        <div className={cn("glass-card p-8 text-center")}>
          <h2
            className={cn("text-xl font-bold mb-2 text-text-primary")}
          >
            找不到會議
          </h2>
          <p className={cn("text-text-muted")}>
            此會議 ID 不存在或已被刪除。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("min-h-screen p-4 sm:p-6 md:p-10")}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      <MeetingHeader meeting={meeting} responsesCount={responses.length} />

      {/* 存取控制：非成員提示 */}
      {discordId && !isMember ? (
        <div className={cn("max-w-6xl mx-auto mb-6")}>
          <div className={cn("glass-card p-4 flex items-center gap-3 border-danger-border bg-danger-bg")}>
            <IconLock className={cn("h-5 w-5 text-danger shrink-0")} />
            <span className={cn("text-sm text-text-secondary")}>
              你不在此會議的受邀名單中，僅能瀏覽但無法填寫時段。
            </span>
          </div>
        </div>
      ) : (
        <LoginStatus discordId={discordId} username={username} avatarUrl={avatarUrl} />
      )}
      <TimeGrid
        dates={dates}
        selectedSlots={selectedSlots}
        slotCounts={slotCounts}
        maxCount={maxCount}
        avatarUrl={avatarUrl}
        organizerSlots={organizerSlots}
        viableSlots={viableSlots}
        durationMinutes={meeting.duration_minutes}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      <div className={cn("max-w-6xl mx-auto flex flex-col gap-4")}>
        <GridLegend avatarUrl={avatarUrl} hasOrganizer={organizerSlots.size > 0} />
        {canInteract && (
          <SaveButton saving={saving} saved={saved} onSave={handleSave} />
        )}
      </div>

      <ResponsesSummary responses={responses} members={members} />

      {toast && (
        <ToastNotification toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
