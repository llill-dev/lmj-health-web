export type DoctorProfileSuccessNavState = {
  flow: 'personal_updated';
  redirectTo?: string;
};

const STORAGE_KEY = 'lmj:doctor-profile-success-nav-state';

function asDoctorProfileSuccessRecord(
  value: unknown,
): { flow?: unknown; redirectTo?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readDoctorProfileRedirectTo(
  record: { flow?: unknown; redirectTo?: unknown },
): string | undefined {
  const value = record.redirectTo;
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function parseDoctorProfileSuccessState(
  raw: string,
): DoctorProfileSuccessNavState | null {
  const parsed = JSON.parse(raw);
  return isDoctorProfileSuccessNavState(parsed)
    ? normalizeDoctorProfileSuccessState(parsed)
    : null;
}

function isDoctorProfileSuccessNavState(
  value: unknown,
): value is DoctorProfileSuccessNavState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asDoctorProfileSuccessRecord(value);
  if (!record) return false;
  return (
    record.flow === 'personal_updated' &&
    (record.redirectTo === undefined || Boolean(readDoctorProfileRedirectTo(record)))
  );
}

function normalizeDoctorProfileSuccessState(
  value: DoctorProfileSuccessNavState,
): DoctorProfileSuccessNavState {
  return {
    flow: 'personal_updated',
    ...(value.redirectTo ? { redirectTo: value.redirectTo.trim() } : {}),
  };
}

export function persistDoctorProfileSuccessNavState(
  state: DoctorProfileSuccessNavState,
) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function peekDoctorProfileSuccessNavState(): DoctorProfileSuccessNavState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = parseDoctorProfileSuccessState(raw);
    if (!state) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearDoctorProfileSuccessNavState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveDoctorProfileSuccessNavState(
  raw: unknown,
): DoctorProfileSuccessNavState | null {
  return isDoctorProfileSuccessNavState(raw)
    ? normalizeDoctorProfileSuccessState(raw)
    : null;
}
