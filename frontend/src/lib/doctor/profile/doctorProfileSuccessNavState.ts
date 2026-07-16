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

function isDoctorProfileSuccessNavState(
  value: unknown,
): value is DoctorProfileSuccessNavState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = asDoctorProfileSuccessRecord(value);
  if (!record) return false;
  return (
    record.flow === 'personal_updated' &&
    (record.redirectTo === undefined ||
      (typeof record.redirectTo === 'string' && record.redirectTo.trim().length > 0))
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
    const parsed: unknown = JSON.parse(raw);
    if (!isDoctorProfileSuccessNavState(parsed)) return null;
    return normalizeDoctorProfileSuccessState(parsed);
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
