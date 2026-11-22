/** Calendar dates follow the school's time zone. */
export const SCHOOL_TIME_ZONE = 'Asia/Seoul';

/** Today's date in Seoul as `YYYY-MM-DD`. */
export function todayInSeoul(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Adds days to a `YYYY-MM-DD` date. */
export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The instant the current Seoul month started. */
export function startOfSeoulMonth(now: Date = new Date()): Date {
  return new Date(`${todayInSeoul(now).slice(0, 8)}01T00:00:00+09:00`);
}

/** Whole calendar days from today (Seoul) to the given instant's Seoul date. */
export function daysUntil(at: Date, now: Date = new Date()): number {
  const target = new Date(`${todayInSeoul(at)}T00:00:00Z`).getTime();
  const today = new Date(`${todayInSeoul(now)}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86_400_000);
}
