import { useState, useCallback } from "react";

export function useTimeGrid(
  selectedSlots: Set<string>,
  setSelectedSlots: React.Dispatch<React.SetStateAction<Set<string>>>,
  onSlotChange?: () => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  const toggleSlot = useCallback(
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
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
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour);
    },
    [selectedSlots, toggleSlot]
  );

  const handleMouseEnter = useCallback(
    (date: string, hour: number) => {
      if (!isDragging) return;
      const key = `${date}-${hour}`;
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
    (date: string, hour: number) => {
      const key = `${date}-${hour}`;
      setIsDragging(true);
      setDragMode(selectedSlots.has(key) ? "remove" : "add");
      toggleSlot(date, hour);
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
        if (cellDate && cellHour) {
          const key = `${cellDate}-${cellHour}`;
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
