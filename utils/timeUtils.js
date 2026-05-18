const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

export { HOURS_12, MINUTES, PERIODS };

/** Parse "06:30 AM" → { hour12, minute, period } */
export function parseTimeLabel(label) {
  const match = String(label || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return { hour12: 6, minute: 0, period: 'AM' };
  }
  return {
    hour12: Math.min(12, Math.max(1, parseInt(match[1], 10))),
    minute: Math.min(59, Math.max(0, parseInt(match[2], 10))),
    period: match[3].toUpperCase(),
  };
}

/** Build display label from parts */
export function buildTimeLabel(hour12, minute, period) {
  const h = Math.min(12, Math.max(1, hour12));
  const m = Math.min(59, Math.max(0, minute));
  const p = period === 'PM' ? 'PM' : 'AM';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
}

/** Convert label → milliseconds timestamp (today's date) */
export function parseTimeToTimestamp(label) {
  const { hour12, minute, period } = parseTimeLabel(label);
  let hour = hour12 % 12;
  if (period === 'PM') hour += 12;
  if (period === 'AM' && hour12 === 12) hour = 0;
  if (period === 'PM' && hour12 === 12) hour = 12;
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

/** Timestamp or numeric string → "06:30 AM" */
export function formatTimestamp(ts) {
  if (ts == null || ts === '') return '';
  const n = typeof ts === 'number' ? ts : parseInt(ts, 10);
  if (Number.isNaN(n) || n < 1e10) {
    if (typeof ts === 'string' && /AM|PM/i.test(ts)) return ts;
    return '';
  }
  const d = new Date(n);
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/** Duration string between two time labels */
export function durationBetween(departLabel, arriveLabel) {
  const dep = parseTimeToTimestamp(departLabel);
  let arr = parseTimeToTimestamp(arriveLabel);
  if (arr <= dep) arr += 24 * 60 * 60 * 1000;
  const mins = Math.round((arr - dep) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
