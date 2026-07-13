export const PX_PER_MINUTE = 2;
export const PX_PER_HOUR = PX_PER_MINUTE * 60;

export const MIN_DURATION = 15;

export const minutesToPx = (minutes: number): number => minutes * PX_PER_MINUTE;
export const pxToMinutes = (px: number): number =>
  Math.floor(px / PX_PER_MINUTE);

export const clampMinutes = (minutes: number): number => {
  return Math.min(Math.max(minutes, 0), 60 * 24);
};
