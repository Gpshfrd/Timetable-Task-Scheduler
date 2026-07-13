export function formatDate(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  return `${weekday}, ${day}`;
}

export function getWeekDays(centerDate: Date | null): Date[] {
  const center = centerDate || new Date();
  const days: Date[] = [];

  for (let i = -2; i <= 2; i++) {
    const day = new Date(center);
    day.setDate(center.getDate() + i);
    days.push(day);
  }

  return days;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
