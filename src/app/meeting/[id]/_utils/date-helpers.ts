/** 時間範圍 8:00 ~ 22:00 */
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

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
