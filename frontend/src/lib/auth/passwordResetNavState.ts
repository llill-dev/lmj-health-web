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
    const parsed = JSON.parse(raw) as PasswordResetPending;
    if (!parsed?.channel || !parsed.destination) return null;
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
    const parsed = JSON.parse(raw) as PasswordResetTokenState;
    if (!parsed?.resetToken) return null;
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
