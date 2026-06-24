export const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonth(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getWeekDates(date: Date): Date[] {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    return current;
  });
}

export function changeMonth(dateKey: string, offset: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const base = new Date(y, m - 1, 1);
  base.setMonth(base.getMonth() + offset);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(d, lastDay));
  return formatDateKey(base);
}

export function changeWeek(dateKey: string, offset: number): string {
  const date = parseDate(dateKey);
  date.setDate(date.getDate() + offset * 7);
  return formatDateKey(date);
}

export function buildCountByDate(todos: { date: string }[]): Record<string, number> {
  return todos.reduce<Record<string, number>>((map, todo) => {
    map[todo.date] = (map[todo.date] ?? 0) + 1;
    return map;
  }, {});
}
