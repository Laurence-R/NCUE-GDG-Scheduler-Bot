import Image from "next/image";
import { cn } from "@/lib/utils";
import { HOURS, formatWeekday, formatShortDate } from "../_utils/date-helpers";

interface TimeGridProps {
  dates: string[];
  selectedSlots: Set<string>;
  slotCounts: Map<string, number>;
  maxCount: number;
  avatarUrl: string;
  onMouseDown: (date: string, hour: number) => void;
  onMouseEnter: (date: string, hour: number) => void;
  onTouchStart: (date: string, hour: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

export function TimeGrid({
  dates,
  selectedSlots,
  slotCounts,
  maxCount,
  avatarUrl,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
  onTouchMove,
}: TimeGridProps) {
  return (
    <div className={cn("max-w-6xl mx-auto mb-6 sm:mb-8")}>
      <div className={cn("glass-card p-3 sm:p-6 overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-2xl")}>
        <div
          className={cn("select-none min-w-fit")}
          onTouchMove={onTouchMove}
        >
          {/* Header row with dates */}
          <div className={cn("flex")}>
            <div className={cn("w-10 sm:w-16 shrink-0")} />
            {dates.map((date) => (
              <div
                key={date}
                className={cn("flex-1 min-w-[40px] sm:min-w-[60px] text-center text-[10px] sm:text-xs font-medium pb-2 text-text-muted")}
              >
                <div>{formatWeekday(date)}</div>
                <div className={cn("text-text-faint")}>
                  {formatShortDate(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {HOURS.map((hour) => (
            <div key={hour} className={cn("flex")}>
              <div
                className={cn("w-10 sm:w-16 shrink-0 text-right pr-1 sm:pr-3 text-[10px] sm:text-xs leading-[28px] sm:leading-[32px] text-text-faint")}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
              {dates.map((date) => {
                const key = `${date}-${hour}`;
                const isSelected = selectedSlots.has(key);
                const othersCount = slotCounts.get(key) ?? 0;
                const displayCount = othersCount + (isSelected ? 1 : 0);
                const heatOpacity =
                  displayCount > 0
                    ? 0.2 + (displayCount / maxCount) * 0.6
                    : 0;

                return (
                  <div
                    key={key}
                    data-date={date}
                    data-hour={hour}
                    className={cn(
                      "flex-1 min-w-[40px] sm:min-w-[60px] h-7 sm:h-8 time-grid-cell rounded-sm m-[1px] flex items-center justify-center text-[9px] sm:text-[10px] relative overflow-hidden",
                      isSelected && "selected"
                    )}
                    style={
                      displayCount > 0
                        ? {
                            background: `rgba(var(--grid-heat-color), ${heatOpacity})`,
                            borderColor: isSelected
                              ? `var(--accent)`
                              : `rgba(var(--grid-heat-color), ${heatOpacity * 0.5})`,
                          }
                        : undefined
                    }
                    onMouseDown={() => onMouseDown(date, hour)}
                    onMouseEnter={() => onMouseEnter(date, hour)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      onTouchStart(date, hour);
                    }}
                  >
                    {isSelected && avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="me"
                        width={18}
                        height={18}
                        className={cn("rounded-full shrink-0 pointer-events-none ring-1 ring-border w-4 h-4")}
                        unoptimized
                      />
                    ) : isSelected ? (
                      <span className={cn("text-accent-foreground font-bold text-[9px] pointer-events-none")}>
                        ✓
                      </span>
                    ) : othersCount > 0 ? (
                      <span className={cn("text-heat-text")}>
                        {othersCount}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
