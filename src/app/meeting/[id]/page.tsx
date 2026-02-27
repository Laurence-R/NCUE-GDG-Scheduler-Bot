"use client";

import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { MeetingContent } from "./_components/meeting-content";

export default function MeetingPage() {
  return (
    <Suspense
      fallback={
        <div className={cn("min-h-screen flex items-center justify-center")}>
          <IconLoader2 className={cn("h-8 w-8 text-accent animate-spin")} />
        </div>
      }
    >
      <MeetingContent />
    </Suspense>
  );
}
