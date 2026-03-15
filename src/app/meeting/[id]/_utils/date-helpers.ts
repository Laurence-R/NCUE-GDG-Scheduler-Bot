/** 可配置的時間範圍（預設 8:00 ~ 22:00，30 分鐘顆粒度） */
const HOUR_START = 8;
const HOUR_END = 22;

/** 30 分鐘為單位的時間區塊 */
export interface TimeBlock {
  hour: number;
  minute: number; // 0 | 30
  label: string;  // "08:00" | "08:30"
}

export const TIME_BLOCKS: TimeBlock[] = Array.from(
  { length: (HOUR_END - HOUR_START) * 2 },
  (_, i) => {
    const hour = HOUR_START + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return {
      hour,
      minute,
      label: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    };
  }
);

/** 產生 slot key（統一格式） */
export function slotKey(date: string, hour: number, minute: number): string {
  return `${date}-${hour}-${minute}`;
}

/** 從 slot key 解析回結構 */
export function parseSlotKey(key: string): { date: string; hour: number; minute: number } {
  const parts = key.split("-");
  const minute = parseInt(parts.pop()!);
  const hour = parseInt(parts.pop()!);
  const date = parts.join("-");
  return { date, hour, minute };
}

/** 取得日期範圍內的所有日期 */
export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatWeekday(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return days[new Date(dateStr).getDay()];
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
