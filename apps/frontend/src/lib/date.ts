const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');

/** 10.30 (금), withTime이면 10.30 (금) 23:59 */
export function formatDate(iso: string, withTime = false) {
  const date = new Date(iso);
  const day = `${date.getMonth() + 1}.${date.getDate()} (${weekdays[date.getDay()]})`;
  return withTime
    ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : day;
}

/** 10.12 */
export function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

/** 10.12 21:48 */
export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return `${formatShortDate(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 2026.10.12 */
export function formatFullDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/** 날짜만 비교한 차이. to가 from보다 뒤면 양수. */
export function dayDiff(from: Date, to: Date) {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 864e5);
}

/** 오늘, 어제, 3일 전, 일주일이 넘으면 10.12 */
export function formatRelative(iso: string, now = new Date()) {
  const days = dayDiff(new Date(iso), now);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return formatShortDate(iso);
}
