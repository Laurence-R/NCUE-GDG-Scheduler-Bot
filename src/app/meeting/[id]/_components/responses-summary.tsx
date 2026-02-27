import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MeetingResponse } from "@/lib/supabase/database.types";
import { getAvatarUrl } from "@/lib/avatar";

interface ResponsesSummaryProps {
  responses: MeetingResponse[];
}

export function ResponsesSummary({ responses }: ResponsesSummaryProps) {
  if (responses.length === 0) return null;

  return (
    <div className={cn("max-w-6xl mx-auto mt-8")}>
      <h3
        className={cn("text-lg font-semibold mb-3 text-text-primary")}
      >
        已回覆的成員 ({responses.length})
      </h3>
      <div className={cn("flex flex-wrap gap-2")}>
        {responses.map((r) => {
          const respAvatarUrl = getAvatarUrl(r.discord_id, r.avatar_hash ?? null);
          return (
            <div
              key={r.id}
              className={cn("glass-card px-3 py-1.5 text-sm flex items-center gap-2 text-text-secondary")}
            >
              <Image
                src={respAvatarUrl}
                alt={r.username}
                width={22}
                height={22}
                className={cn("rounded-full shrink-0")}
                unoptimized
              />
              <span>{r.username}</span>
              <span
                className={cn("text-xs text-text-faint")}
              >
                {r.available_slots.length} 個時段
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
