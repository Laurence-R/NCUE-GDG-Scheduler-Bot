import Image from "next/image";
import { cn } from "@/lib/utils";

interface GridLegendProps {
  avatarUrl: string;
}

export function GridLegend({ avatarUrl }: GridLegendProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-text-muted")}
    >
      <div className={cn("flex items-center gap-1.5 sm:gap-2")}>
        <div
          className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-sm flex items-center justify-center")}
          style={{
            background: "rgba(var(--grid-heat-color), 0.3)",
            boxShadow: "inset 0 0 0 1.5px var(--accent)",
            border: "1px solid var(--accent)",
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="me"
              width={10}
              height={10}
              className={cn("rounded-full w-2 h-2")}
              unoptimized
            />
          ) : (
            <span className={cn("text-accent-foreground text-[6px]")}>✓</span>
          )}
        </div>
        <span>你的選擇</span>
      </div>
      <div className={cn("flex items-center gap-1.5 sm:gap-2")}>
        <div
          className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-sm")}
          style={{
            background: "rgba(var(--grid-heat-color), 0.4)",
            border: "1px solid rgba(var(--grid-heat-color), 0.2)",
          }}
        />
        <span>其他人可用</span>
      </div>
      <div className={cn("flex items-center gap-1.5 sm:gap-2")}>
        <div
          className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-sm border border-grid-cell-border bg-transparent")}
        />
        <span>無人選擇</span>
      </div>
    </div>
  );
}
