import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MeetingResponse, MeetingMember } from "@/lib/supabase/database.types";
import { getAvatarUrl } from "@/lib/avatar";
import { IconCheck, IconClock, IconCrown } from "@tabler/icons-react";

interface ResponsesSummaryProps {
  responses: MeetingResponse[];
  members: MeetingMember[];
}

export function ResponsesSummary({ responses, members }: ResponsesSummaryProps) {
  // 用 discord_id 快速查找是否已回覆
  const filledIds = new Set(responses.map((r) => r.discord_id));
  const filledMembers = members.filter((m) => filledIds.has(m.discord_id));
  const unfilledMembers = members.filter((m) => !filledIds.has(m.discord_id));

  if (members.length === 0) return null;

  return (
    <div className={cn("max-w-6xl mx-auto mt-8 space-y-6")}>
      {/* 已回覆 */}
      <div>
        <h3 className={cn("text-lg font-semibold mb-3 text-text-primary flex items-center gap-2")}>
          <IconCheck className={cn("h-4 w-4 text-success")} />
          已回覆 ({filledMembers.length})
        </h3>
        {filledMembers.length > 0 ? (
          <div className={cn("flex flex-wrap gap-2")}>
            {filledMembers.map((m) => {
              const avatar = getAvatarUrl(m.discord_id, m.avatar_hash);
              const response = responses.find((r) => r.discord_id === m.discord_id);
              return (
                <div
                  key={m.id}
                  className={cn("glass-card px-3 py-1.5 text-sm flex items-center gap-2 text-text-secondary")}
                >
                  <Image src={avatar} alt={m.username} width={22} height={22} className={cn("rounded-full shrink-0")} unoptimized />
                  <span>{m.username}</span>
                  {m.is_organizer && <IconCrown className={cn("h-3.5 w-3.5 text-amber-400")} title="發起人" />}
                  <span className={cn("text-xs text-text-faint")}>
                    {response?.available_slots.length ?? 0} 個時段
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={cn("text-sm text-text-faint")}>尚無人回覆</p>
        )}
      </div>

      {/* 尚未回覆 */}
      {unfilledMembers.length > 0 && (
        <div>
          <h3 className={cn("text-lg font-semibold mb-3 text-text-primary flex items-center gap-2")}>
            <IconClock className={cn("h-4 w-4 text-warning")} />
            尚未回覆 ({unfilledMembers.length})
          </h3>
          <div className={cn("flex flex-wrap gap-2")}>
            {unfilledMembers.map((m) => {
              const avatar = getAvatarUrl(m.discord_id, m.avatar_hash);
              return (
                <div
                  key={m.id}
                  className={cn("glass-card px-3 py-1.5 text-sm flex items-center gap-2 text-text-faint")}
                >
                  <Image src={avatar} alt={m.username} width={22} height={22} className={cn("rounded-full shrink-0 opacity-50")} unoptimized />
                  <span>{m.username}</span>
                  {m.is_organizer && <IconCrown className={cn("h-3.5 w-3.5 text-amber-400")} title="發起人" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
