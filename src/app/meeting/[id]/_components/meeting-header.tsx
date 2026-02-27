import { IconCalendarEvent, IconClock, IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Meeting } from "@/lib/supabase/database.types";

interface MeetingHeaderProps {
  meeting: Meeting;
  responsesCount: number;
}

export function MeetingHeader({ meeting, responsesCount }: MeetingHeaderProps) {
  return (
    <div className={cn("max-w-6xl mx-auto mb-6 sm:mb-8")}>
      <h1
        className={cn("text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 sm:gap-3 text-text-primary")}
      >
        <IconCalendarEvent className={cn("h-5 w-5 sm:h-7 sm:w-7 text-accent shrink-0")} />
        <span className={cn("break-words")}>{meeting.name}</span>
      </h1>
      {meeting.description && (
        <p className={cn("mb-4 text-text-muted")}>
          {meeting.description}
        </p>
      )}
      <div
        className={cn("flex flex-wrap items-center gap-4 text-sm text-text-muted")}
      >
        <span className={cn("flex items-center gap-1.5")}>
          <IconClock className={cn("h-4 w-4")} />
          {meeting.date_range_start} ~ {meeting.date_range_end}
        </span>
        <span className={cn("flex items-center gap-1.5")}>
          <IconUsers className={cn("h-4 w-4")} />
          {responsesCount} / {meeting.participants_count} 人已回覆
        </span>
        <span
          className={cn("font-mono text-xs text-text-faint")}
        >
          {meeting.id}
        </span>
      </div>
    </div>
  );
}
