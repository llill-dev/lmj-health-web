import { PHONE_DIAL_CODES } from '@/lib/phone/dialCodes';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

const DIAL_CODES_LONGEST_FIRST = [...PHONE_DIAL_CODES].sort(
  (a, b) => b.length - a.length,
);

/**
 * Normalize a user-entered phone for auth APIs (`POST /auth/login`, reset, claim, …).
 * API-3 expects E.164 (`+963912345678`), not `00963…` or local `09…` formats.
 */
export function normalizeAuthPhoneIdentifier(raw: string): string {
  let phone = raw.trim().replace(/[\s\-()]/g, '');
  if (!phone) return phone;

  if (phone.startsWith('00')) {
    phone = `+${phone.slice(2)}`;
  }

  if (phone.startsWith('+')) {
    return phone;
  }

  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone;

  for (const dial of DIAL_CODES_LONGEST_FIRST) {
    const codeDigits = dial.slice(1);
    if (digits.startsWith(codeDigits) && digits.length > codeDigits.length + 6) {
      return `${dial}${digits.slice(codeDigits.length).replace(/^0+/, '')}`;
    }
  }

  const local = digits.replace(/^0+/, '');

  // Default national format for Syria when no country prefix is present.
  if (/^9\d{8}$/.test(local)) {
    return `+963${local}`;
  }

  return `+${local}`;
}

export function isValidAuthPhoneIdentifier(raw: string): boolean {
  return E164_REGEX.test(normalizeAuthPhoneIdentifier(raw));
}

export function resolveLoginIdentifier(identifier: string): {
  email?: string;
  phone?: string;
} {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase() };
  }
  return { phone: normalizeAuthPhoneIdentifier(trimmed) };
}
