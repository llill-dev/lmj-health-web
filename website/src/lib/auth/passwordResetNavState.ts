export type PasswordResetPending = {
  channel: 'email' | 'whatsapp';
  email?: string;
  phone?: string;
  destination: string;
  fullName?: string;
};

export type PasswordResetTokenState = {
  resetToken: string;
  expiresInMinutes: number;
  fullName?: string;
  email?: string;
  phone?: string;
};

const PENDING_KEY = 'lmj:password-reset-pending';
const TOKEN_KEY = 'lmj:password-reset-token';

function asPasswordResetPendingRecord(
  value: unknown,
): { channel?: unknown; destination?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readPasswordResetPendingString(
  record: { channel?: unknown; destination?: unknown },
  key: 'destination',
): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function parsePasswordResetPending(raw: string): PasswordResetPending | null {
  const parsed = JSON.parse(raw);
  return isPasswordResetPending(parsed) ? parsed : null;
}

function isPasswordResetPending(value: unknown): value is PasswordResetPending {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asPasswordResetPendingRecord(value);
  if (!record) return false;
  return (
    (record.channel === 'email' || record.channel === 'whatsapp') &&
    Boolean(readPasswordResetPendingString(record, 'destination'))
  );
}

function asPasswordResetTokenRecord(
  value: unknown,
): { resetToken?: unknown; expiresInMinutes?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readPasswordResetTokenString(
  record: { resetToken?: unknown; expiresInMinutes?: unknown },
): string | undefined {
  const value = record.resetToken;
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function parsePasswordResetToken(raw: string): PasswordResetTokenState | null {
  const parsed = JSON.parse(raw);
  return isPasswordResetTokenState(parsed) ? parsed : null;
}

function isPasswordResetTokenState(
  value: unknown,
): value is PasswordResetTokenState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asPasswordResetTokenRecord(value);
  if (!record) return false;
  return (
    Boolean(readPasswordResetTokenString(record)) &&
    typeof record.expiresInMinutes === 'number'
  );
}

export function persistPasswordResetPending(state: PasswordResetPending) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function peekPasswordResetPending(): PasswordResetPending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return parsePasswordResetPending(raw);
  } catch {
    return null;
  }
}

export function clearPasswordResetPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function persistPasswordResetToken(state: PasswordResetTokenState) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function peekPasswordResetToken(): PasswordResetTokenState | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return parsePasswordResetToken(raw);
  } catch {
    return null;
  }
}

export function clearPasswordResetToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPasswordResetFlow() {
  clearPasswordResetPending();
  clearPasswordResetToken();
}
