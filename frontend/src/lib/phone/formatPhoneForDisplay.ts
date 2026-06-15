import { PHONE_DIAL_CODES } from '@/lib/phone/dialCodes';
import { normalizeAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

const DIAL_CODES_LONGEST_FIRST = [...PHONE_DIAL_CODES].sort(
  (a, b) => b.length - a.length,
);

function groupNationalDigits(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  const tail = digits.slice(-3);
  const mid = digits.slice(-6, -3);
  const head = digits.slice(0, -6);
  return [head, mid, tail].filter(Boolean).join(' ');
}

/**
 * Display-only formatting for phone numbers in admin UI.
 * Normalizes messy stored values first, then groups digits for readability.
 */
export function formatPhoneForDisplay(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '—';

  const normalized = normalizeAuthPhoneIdentifier(trimmed);
  if (!E164_REGEX.test(normalized)) return trimmed;

  const syriaMatch = normalized.match(/^(\+963)(9\d{8})$/);
  if (syriaMatch) {
    const local = syriaMatch[2];
    return `${syriaMatch[1]} ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  for (const dial of DIAL_CODES_LONGEST_FIRST) {
    if (normalized.startsWith(dial) && normalized.length > dial.length + 3) {
      const national = normalized.slice(dial.length);
      return `${dial} ${groupNationalDigits(national)}`;
    }
  }

  return normalized;
}

/** Canonical E.164 key for comparing duplicate phones in lists. */
export function phoneComparisonKey(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const normalized = normalizeAuthPhoneIdentifier(trimmed);
  return E164_REGEX.test(normalized) ? normalized : null;
}
