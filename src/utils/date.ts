export function formatDate(date: Date) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    return `${weekday}, ${day}`;
}

export function getFiveWeekDays(now: Date) {
    const days = [];
    for (let i = -2; i <= 2; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() + i);
        days.push(day);
    }
    return days;
}