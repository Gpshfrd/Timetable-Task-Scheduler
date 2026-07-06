export function formatDate(date: Date) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
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
    return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
}

// export function getWeekRange(weekOffset: number): string {
//     const days = getWeekDays(weekOffset);
//     if (days.length === 0) return '';

//     const start = days[0];
//     const end = days[days.length - 1];
//     const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
//     const endMonth = start.toLocaleDateString('en-US', { month: 'short' });
//     const startDay = start.getDate();
//     const endDay = end.getDate();
//     const year = start.getFullYear();

//     if (startMonth === endMonth) {
//         return `${startMonth} ${startDay} - ${endDay}, ${year}`;
//     }

//     return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
// }