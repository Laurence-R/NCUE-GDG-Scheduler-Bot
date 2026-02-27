import { useState, useEffect } from "react";
import type { Meeting, MeetingResponse, TimeSlot } from "@/lib/supabase/database.types";

export function useMeetingData(meetingId: string, discordId: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [responses, setResponses] = useState<MeetingResponse[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) return;
        const json = await res.json();
        setMeeting(json.data?.meeting ?? null);
        setResponses(json.data?.responses ?? []);

        // 如果使用者已有回覆，載入已選擇的時段
        if (discordId) {
          const existing = json.data?.responses?.find(
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

  return { meeting, responses, setResponses, selectedSlots, setSelectedSlots, loading };
}
