import Image from "next/image";
import { useCallback, useRef, useState } from "react";
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
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusRow, setFocusRow] = useState(0);
  const [focusCol, setFocusCol] = useState(0);

  const moveFocus = useCallback(
    (row: number, col: number) => {
      const r = Math.max(0, Math.min(row, HOURS.length - 1));
      const c = Math.max(0, Math.min(col, dates.length - 1));
      setFocusRow(r);
      setFocusCol(c);
      // 聚焦到對應的 cell
      const cell = gridRef.current?.querySelector<HTMLElement>(
        `[data-row="${r}"][data-col="${c}"]`
      );
      cell?.focus();
    },
    [dates.length]
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let handled = true;
      switch (e.key) {
        case "ArrowUp":
          moveFocus(focusRow - 1, focusCol);
          break;
        case "ArrowDown":
          moveFocus(focusRow + 1, focusCol);
          break;
        case "ArrowLeft":
          moveFocus(focusRow, focusCol - 1);
          break;
        case "ArrowRight":
          moveFocus(focusRow, focusCol + 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onMouseDown(dates[focusCol], HOURS[focusRow]);
          break;
        case "Home":
          moveFocus(focusRow, 0);
          break;
        case "End":
          moveFocus(focusRow, dates.length - 1);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    },
    [focusRow, focusCol, dates, moveFocus, onMouseDown]
  );

  return (
    <div className={cn("max-w-6xl mx-auto mb-6 sm:mb-8")}>
      <div className={cn("glass-card p-3 sm:p-6 overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-2xl")}>
        <div
          ref={gridRef}
          role="grid"
          aria-label="可用時間選擇表"
          className={cn("select-none min-w-fit")}
          onTouchMove={onTouchMove}
          onKeyDown={handleGridKeyDown}
        >
          {/* Header row with dates */}
          <div className={cn("flex")} role="row">
            <div className={cn("w-10 sm:w-16 shrink-0")} role="columnheader" />
            {dates.map((date) => (
              <div
                key={date}
                role="columnheader"
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
          {HOURS.map((hour, rowIdx) => (
            <div key={hour} className={cn("flex")} role="row">
              <div
                role="rowheader"
                className={cn("w-10 sm:w-16 shrink-0 text-right pr-1 sm:pr-3 text-[10px] sm:text-xs leading-[28px] sm:leading-[32px] text-text-faint")}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
              {dates.map((date, colIdx) => {
                const key = `${date}-${hour}`;
                const isSelected = selectedSlots.has(key);
                const othersCount = slotCounts.get(key) ?? 0;
                const displayCount = othersCount + (isSelected ? 1 : 0);
                const heatOpacity =
                  displayCount > 0
                    ? 0.2 + (displayCount / maxCount) * 0.6
                    : 0;
                const isFocused = rowIdx === focusRow && colIdx === focusCol;

                return (
                  <div
                    key={key}
                    role="gridcell"
                    tabIndex={isFocused ? 0 : -1}
                    data-row={rowIdx}
                    data-col={colIdx}
                    data-date={date}
                    data-hour={hour}
                    aria-label={`${date} ${hour}:00${isSelected ? "（已選取）" : ""}`}
                    aria-selected={isSelected}
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
