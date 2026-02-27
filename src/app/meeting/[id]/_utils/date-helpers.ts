/** 可配置的時間範圍（預設 8:00 ~ 22:00） */
const HOUR_START = 8;
const HOUR_END = 22;

export const HOURS = Array.from(
  { length: HOUR_END - HOUR_START + 1 },
  (_, i) => i + HOUR_START
);

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
