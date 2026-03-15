import { useState, useCallback } from "react";
import { slotKey } from "../_utils/date-helpers";

export function useTimeGrid(
  selectedSlots: Set<string>,
  setSelectedSlots: React.Dispatch<React.SetStateAction<Set<string>>>,
  onSlotChange?: () => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  const toggleSlot = useCallback(
    (date: string, hour: number, minute: number) => {
      const key = slotKey(date, hour, minute);
      setSelectedSlots((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      onSlotChange?.();
    },
    [setSelectedSlots, onSlotChange]
  );

  const handleMouseDown = useCallback(
    (date: string, hour: number, minute: number) => {
      const key = slotKey(date, hour, minute);
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour, minute);
    },
    [selectedSlots, toggleSlot]
  );

  const handleMouseEnter = useCallback(
    (date: string, hour: number, minute: number) => {
      if (!isDragging) return;
      const key = slotKey(date, hour, minute);
      setSelectedSlots((prev) => {
        const next = new Set(prev);
        if (dragMode === "add") {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
      onSlotChange?.();
    },
    [isDragging, dragMode, setSelectedSlots, onSlotChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (date: string, hour: number, minute: number) => {
      const key = slotKey(date, hour, minute);
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour, minute);
    },
    [selectedSlots, toggleSlot]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el instanceof HTMLElement) {
        const cellDate = el.dataset.date;
        const cellHour = el.dataset.hour;
        const cellMinute = el.dataset.minute;
        if (cellDate && cellHour && cellMinute) {
          const key = slotKey(cellDate, parseInt(cellHour), parseInt(cellMinute));
          setSelectedSlots((prev) => {
            const next = new Set(prev);
            if (dragMode === "add") {
              next.add(key);
            } else {
              next.delete(key);
            }
            return next;
          });
          onSlotChange?.();
        }
      }
    },
    [isDragging, dragMode, setSelectedSlots, onSlotChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
