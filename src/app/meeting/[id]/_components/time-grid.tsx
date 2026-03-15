import Image from "next/image";
import { memo, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TIME_BLOCKS, slotKey, formatWeekday, formatShortDate } from "../_utils/date-helpers";

/* ------------------------------------------------------------------ */
/*  GridCell — memoized 以避免拖曳時全部格子重繪                         */
/* ------------------------------------------------------------------ */
interface GridCellProps {
  cellKey: string;
  rowIdx: number;
  colIdx: number;
  date: string;
  hour: number;
  minute: number;
  label: string;
  isSelected: boolean;
  othersCount: number;
  heatOpacity: number;
  isFocused: boolean;
  isOrgAvailable: boolean;
  isScattered: boolean;
  avatarUrl: string;
  onMouseDown: (date: string, hour: number, minute: number) => void;
  onMouseEnter: (date: string, hour: number, minute: number) => void;
  onTouchStart: (date: string, hour: number, minute: number) => void;
}

const GridCell = memo(function GridCell({
  cellKey,
  rowIdx,
  colIdx,
  date,
  hour,
  minute,
  label,
  isSelected,
  othersCount,
  heatOpacity,
  isFocused,
  isOrgAvailable,
  isScattered,
  avatarUrl,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
}: GridCellProps) {
  const displayCount = othersCount + (isSelected ? 1 : 0);

  return (
    <div
      key={cellKey}
      role="gridcell"
      tabIndex={isFocused ? 0 : -1}
      data-row={rowIdx}
      data-col={colIdx}
      data-date={date}
      data-hour={hour}
      data-minute={minute}
      aria-label={`${date} ${label}${isSelected ? "（已選取）" : ""}`}
      aria-selected={isSelected}
      className={cn(
        "flex-1 min-w-[40px] sm:min-w-[60px] h-7 sm:h-8 time-grid-cell rounded-sm m-[1px] flex items-center justify-center text-[9px] sm:text-[10px] relative overflow-hidden",
        isSelected && "selected",
        isOrgAvailable && displayCount > 0 && "ring-1 ring-amber-400/70",
        isScattered && "opacity-40"
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
      onMouseDown={() => onMouseDown(date, hour, minute)}
      onMouseEnter={() => onMouseEnter(date, hour, minute)}
      onTouchStart={(e) => {
        e.preventDefault();
        onTouchStart(date, hour, minute);
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
});

interface TimeGridProps {
  dates: string[];
  selectedSlots: Set<string>;
  slotCounts: Map<string, number>;
  maxCount: number;
  avatarUrl: string;
  organizerSlots: Set<string>;
  viableSlots: Set<string>;
  durationMinutes: number;
  onMouseDown: (date: string, hour: number, minute: number) => void;
  onMouseEnter: (date: string, hour: number, minute: number) => void;
  onTouchStart: (date: string, hour: number, minute: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

export function TimeGrid({
  dates,
  selectedSlots,
  slotCounts,
  maxCount,
  avatarUrl,
  organizerSlots,
  viableSlots,
  durationMinutes,
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
      const r = Math.max(0, Math.min(row, TIME_BLOCKS.length - 1));
      const c = Math.max(0, Math.min(col, dates.length - 1));
      setFocusRow(r);
      setFocusCol(c);
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
          onMouseDown(dates[focusCol], TIME_BLOCKS[focusRow].hour, TIME_BLOCKS[focusRow].minute);
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
            <div className={cn("w-12 sm:w-16 shrink-0")} role="columnheader" />
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

          {/* Grid rows — 30 min blocks */}
          {TIME_BLOCKS.map((block, rowIdx) => {
            const isHourStart = block.minute === 0;
            return (
              <div key={`${block.hour}-${block.minute}`} className={cn("flex", isHourStart && rowIdx > 0 && "mt-[2px]")} role="row">
                <div
                  role="rowheader"
                  className={cn(
                    "w-12 sm:w-16 shrink-0 text-right pr-1 sm:pr-3 text-[10px] sm:text-xs leading-[28px] sm:leading-[32px]",
                    isHourStart ? "text-text-faint" : "text-text-faint/40"
                  )}
                >
                  {block.label}
                </div>
                {dates.map((date, colIdx) => {
                  const key = slotKey(date, block.hour, block.minute);
                  const isSelected = selectedSlots.has(key);
                  const othersCount = slotCounts.get(key) ?? 0;
                  const displayCount = othersCount + (isSelected ? 1 : 0);
                  const heatOpacity =
                    displayCount > 0
                      ? 0.2 + (displayCount / maxCount) * 0.6
                      : 0;
                  const isFocused = rowIdx === focusRow && colIdx === focusCol;
                  const isOrgAvailable = organizerSlots.has(key);
                  const isViable = viableSlots.has(key);
                  const isScattered = displayCount > 0 && !isViable;

                  return (
                    <GridCell
                      key={key}
                      cellKey={key}
                      rowIdx={rowIdx}
                      colIdx={colIdx}
                      date={date}
                      hour={block.hour}
                      minute={block.minute}
                      label={block.label}
                      isSelected={isSelected}
                      othersCount={othersCount}
                      heatOpacity={heatOpacity}
                      isFocused={isFocused}
                      isOrgAvailable={isOrgAvailable}
                      isScattered={isScattered}
                      avatarUrl={avatarUrl}
                      onMouseDown={onMouseDown}
                      onMouseEnter={onMouseEnter}
                      onTouchStart={onTouchStart}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
