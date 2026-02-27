"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import type { TimeSlot } from "@/lib/supabase/database.types";
import { useMeetingData } from "../_hooks/use-meeting-data";
import { useTimeGrid } from "../_hooks/use-time-grid";
import { useToast } from "../_hooks/use-toast";
import { getDatesInRange } from "../_utils/date-helpers";
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

  const { meeting, responses, setResponses, selectedSlots, setSelectedSlots, loading } =
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

  // 計算每個時段有多少「其他人」可用（排除自己的舊回覆）
  const { slotCounts, maxCount } = useMemo(() => {
    const counts = new Map<string, number>();
    responses.forEach((r) => {
      if (r.discord_id === discordId) return;
      r.available_slots.forEach((s) => {
        const key = `${s.date}-${s.hour}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    const othersMax = counts.size > 0 ? Math.max(...counts.values()) : 0;
    const max = Math.max(1, othersMax + (discordId ? 1 : 0));
    return { slotCounts: counts, maxCount: max };
  }, [responses, discordId]);

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
      <LoginStatus
        discordId={discordId}
        username={username}
        avatarUrl={avatarUrl}
      />
      <TimeGrid
        dates={dates}
        selectedSlots={selectedSlots}
        slotCounts={slotCounts}
        maxCount={maxCount}
        avatarUrl={avatarUrl}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      <div className={cn("max-w-6xl mx-auto flex flex-col gap-4")}>
        <GridLegend avatarUrl={avatarUrl} />
        {discordId && (
          <SaveButton saving={saving} saved={saved} onSave={handleSave} />
        )}
      </div>

      <ResponsesSummary responses={responses} />

      {toast && (
        <ToastNotification toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
