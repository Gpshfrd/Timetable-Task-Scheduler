export function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 12 ? hours - 12 : hours}:${mins.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
};

export  function getNowLineMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

export function minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function timeStringToMinutes(time: string) {
    const [hoursStr, minutesStr] = time.split(':').map(Number);
    return hoursStr * 60 + minutesStr;
}

export function roundToStep(value: number, step = 15): number {
    return Math.round(value / step) * step;
}