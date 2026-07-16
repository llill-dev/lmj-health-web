import type { AccountDeletionStatus } from '@/lib/auth/accountDeletionTypes';
import {
  readAuthUser,
  writeAuthUser,
  type PersistedUser,
} from '@/lib/cookies';
import { readStoredAuthSession, toPersistedUser } from '@/lib/auth/session';

export type AccountDeletionSessionMeta = {
  status: AccountDeletionStatus;
  requestedAt?: string | null;
  recoverUntil?: string | null;
};

export type PendingDoctorRecoveryLogin = {
  email?: string;
  phone?: string;
  role: 'doctor' | 'patient';
  recoverUntil?: string | null;
  lifecycleAction?: string;
};

type AccountDeletionRecoveryPayload = {
  recoverUntil?: unknown;
  recoveryExpiresAt?: unknown;
  recoveryUntil?: unknown;
  recover_until?: unknown;
  [key: string]: unknown;
};

function asPendingDoctorRecoveryLoginRecord(
  value: unknown,
): { role?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function isPendingDoctorRecoveryLogin(
  value: unknown,
): value is PendingDoctorRecoveryLogin {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asPendingDoctorRecoveryLoginRecord(value);
  if (!record) return false;
  return record.role === 'doctor' || record.role === 'patient';
}

const PENDING_DOCTOR_RECOVERY_KEY = 'lmj:pending-doctor-recovery';

export function persistPendingDoctorRecoveryLogin(
  state: PendingDoctorRecoveryLogin,
) {
  try {
    sessionStorage.setItem(PENDING_DOCTOR_RECOVERY_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function peekPendingDoctorRecoveryLogin(): PendingDoctorRecoveryLogin | null {
  try {
    const raw = sessionStorage.getItem(PENDING_DOCTOR_RECOVERY_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPendingDoctorRecoveryLogin(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingDoctorRecoveryLogin() {
  try {
    sessionStorage.removeItem(PENDING_DOCTOR_RECOVERY_KEY);
  } catch {
    /* ignore */
  }
}

export function normalizeRecoverUntil(
  raw: AccountDeletionRecoveryPayload,
): string | null | undefined {
  const value =
    raw.recoverUntil ??
    raw.recoveryExpiresAt ??
    raw.recoveryUntil ??
    raw.recover_until;
  return typeof value === 'string' ? value : null;
}

export function readAccountDeletionSessionMeta():
  | AccountDeletionSessionMeta
  | null {
  const user = readAuthUser();
  if (!user?.accountDeletionStatus) return null;
  if (user.accountDeletionStatus === 'none') return null;

  return {
    status: user.accountDeletionStatus,
    requestedAt: user.deletionRequestedAt ?? null,
    recoverUntil: user.deletionRecoverUntil ?? null,
  };
}

export function persistAccountDeletionSessionMeta(input: {
  status: AccountDeletionStatus;
  requestedAt?: string | null;
  recoverUntil?: string | null;
}): void {
  const session = readStoredAuthSession();
  const user = session.user;
  if (!user) return;

  const nextUser: PersistedUser = {
    ...user,
    accountDeletionStatus: input.status,
    deletionRequestedAt: input.requestedAt ?? null,
    deletionRecoverUntil: input.recoverUntil ?? null,
  };

  writeAuthUser(nextUser);
}

export function clearAccountDeletionSessionMeta(): void {
  const session = readStoredAuthSession();
  const user = session.user;
  if (!user) return;

  writeAuthUser({
    ...user,
    accountDeletionStatus: 'none',
    deletionRequestedAt: null,
    deletionRecoverUntil: null,
  });
}

export function isRecoverWindowOpen(recoverUntil?: string | null): boolean {
  if (!recoverUntil) return true;
  const date = new Date(recoverUntil);
  if (Number.isNaN(date.getTime())) return true;
  return date.getTime() > Date.now();
}

export function resolveRestorePath(role?: string | null): string {
  if (role === 'patient') return '/patient/restore-account';
  return '/doctor/restore-account';
}

export function resolveDeleteAccountPath(role?: string | null): string {
  if (role === 'patient') return '/patient/delete-account';
  return '/doctor/delete-account';
}

export type DoctorRestoreMode = 'self_recovery' | 'restore_request';

/** يحدد مسار استرجاع الطبيب: فوري خلال 7 أيام أو طلب مراجعة بعدها. */
export function resolveDoctorRestoreMode(input: {
  lifecycleAction?: string | null;
  recoverUntil?: string | null;
}): DoctorRestoreMode {
  if (input.lifecycleAction === 'restore_request') return 'restore_request';
  if (input.lifecycleAction === 'self_recovery') return 'self_recovery';
  if (!isRecoverWindowOpen(input.recoverUntil)) return 'restore_request';
  return 'self_recovery';
}

export function isDoctorRestoreEligible(input: {
  accountDeletionStatus?: string | null;
  recoverUntil?: string | null;
  restoreMode: DoctorRestoreMode;
}): boolean {
  const status = normalizeAccountDeletionStatus(input.accountDeletionStatus);

  if (input.restoreMode === 'self_recovery') {
    return isAccountDeletionPending({
      accountDeletionStatus: status,
      recoverUntil: input.recoverUntil,
    });
  }

  return status === 'requested' || status === 'pending' || status === 'deleted';
}

const PENDING_DELETION_STATUSES: AccountDeletionStatus[] = ['requested', 'pending'];

/** يطبّع قيمة الحالة من login/cookie/API — أي قيمة غير معروفة = none (حساب نشط). */
export function normalizeAccountDeletionStatus(
  raw?: string | null,
): AccountDeletionStatus {
  if (raw === 'requested' || raw === 'pending' || raw === 'deleted') {
    return raw;
  }
  return 'none';
}

export function isAccountDeletionPending(input: {
  accountDeletionStatus?: string | null;
  recoverUntil?: string | null;
}): boolean {
  const status = normalizeAccountDeletionStatus(input.accountDeletionStatus);
  if (!PENDING_DELETION_STATUSES.includes(status)) return false;
  return isRecoverWindowOpen(input.recoverUntil);
}

export function shouldRedirectToRestore(input: {
  accountDeletionStatus?: string | null;
  recoverUntil?: string | null;
}): boolean {
  return isAccountDeletionPending(input);
}

function isRestoreAccountPath(path: string): boolean {
  return (
    path.startsWith('/doctor/restore-account') ||
    path.startsWith('/patient/restore-account')
  );
}

/** يمنع توجيه حساب نشط إلى restore-account عبر ?next= بعد تسجيل الدخول. */
export function sanitizePostLoginNextPath(
  next: string | null | undefined,
  input: {
    accountDeletionStatus?: string | null;
    recoverUntil?: string | null;
  },
): string | null {
  if (!next) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return null;
  }
  if (!decoded.startsWith('/')) return null;
  if (isRestoreAccountPath(decoded) && !isAccountDeletionPending(input)) {
    return null;
  }
  return decoded;
}

export function buildDeletionSessionFromLogin(data: {
  accountDeletionStatus?: string | null;
  requestedAt?: string | null;
  recoverUntil?: string | null;
}): Pick<
  PersistedUser,
  'accountDeletionStatus' | 'deletionRequestedAt' | 'deletionRecoverUntil'
> {
  const status = normalizeAccountDeletionStatus(data.accountDeletionStatus);
  return {
    accountDeletionStatus: status,
    deletionRequestedAt: data.requestedAt ?? null,
    deletionRecoverUntil: data.recoverUntil ?? null,
  };
}
