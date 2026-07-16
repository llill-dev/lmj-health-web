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

function isPasswordResetPending(value: unknown): value is PasswordResetPending {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asPasswordResetPendingRecord(value);
  if (!record) return false;
  return (
    (record.channel === 'email' || record.channel === 'whatsapp') &&
    typeof record.destination === 'string' &&
    record.destination.trim().length > 0
  );
}

function asPasswordResetTokenRecord(
  value: unknown,
): { resetToken?: unknown; expiresInMinutes?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function isPasswordResetTokenState(
  value: unknown,
): value is PasswordResetTokenState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asPasswordResetTokenRecord(value);
  if (!record) return false;
  return (
    typeof record.resetToken === 'string' &&
    record.resetToken.trim().length > 0 &&
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
    const parsed: unknown = JSON.parse(raw);
    if (!isPasswordResetPending(parsed)) return null;
    return parsed;
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
    const parsed: unknown = JSON.parse(raw);
    if (!isPasswordResetTokenState(parsed)) return null;
    return parsed;
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
