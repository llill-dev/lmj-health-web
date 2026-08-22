/**
 * Shared, ISO-safe formatter for appointment dates/times.
 *
 * Previously several components each defined their own local `formatDashDate` that
 * naively did `iso.split('-')`, assuming `date` was always a plain `YYYY-MM-DD` string.
 * When the API instead returns a full ISO datetime (e.g. `2026-05-25T00:00:00.000Z`),
 * that split produces garbage like `25T00:00:00.000Z-05-2026`. This module parses with
 * `Date` instead, so it handles both shapes correctly, and is the single place appointment
 * date/time formatting should live — do not re-add a local duplicate.
 */

/** `DD-MM-YYYY`, Latin digits, safe for both `YYYY-MM-DD` and full ISO datetime input. */
export function formatAppointmentDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats a 24h `HH:MM` time string as a 12h value with مساء/صباحاً, e.g. `14:05` -> `02:05 مساء`.
 * Falls back to the raw input for anything that doesn't parse as `HH:MM`.
 */
export function formatAppointmentTime(value?: string | null): string {
  if (!value) return '—';
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return value;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours24) || hours24 > 23) return value;
  const period = hours24 >= 12 ? 'مساءً' : 'صباحًا';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${minutes} ${period}`;
}
