export type ClaimAccountPending = {
  channel: 'email' | 'whatsapp';
  email?: string;
  phone?: string;
  destination: string;
  fullName?: string;
};

const PENDING_KEY = 'lmj:claim-account-pending';

function asClaimAccountPendingRecord(
  value: unknown,
): { channel?: unknown; destination?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readClaimAccountPendingString(
  record: { channel?: unknown; destination?: unknown },
  key: 'destination',
): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function parseClaimAccountPending(raw: string): ClaimAccountPending | null {
  const parsed = JSON.parse(raw);
  return isClaimAccountPending(parsed) ? parsed : null;
}

function isClaimAccountPending(value: unknown): value is ClaimAccountPending {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asClaimAccountPendingRecord(value);
  if (!record) return false;
  return (
    (record.channel === 'email' || record.channel === 'whatsapp') &&
    Boolean(readClaimAccountPendingString(record, 'destination'))
  );
}

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
    return parseClaimAccountPending(raw);
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
