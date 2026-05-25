export type ClaimAccountPending = {
  channel: 'email' | 'whatsapp';
  email?: string;
  phone?: string;
  destination: string;
  fullName?: string;
};

const PENDING_KEY = 'lmj:claim-account-pending';

export function persistClaimAccountPending(state: ClaimAccountPending) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function peekClaimAccountPending(): ClaimAccountPending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClaimAccountPending;
    if (!parsed?.channel || !parsed.destination) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearClaimAccountPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}
