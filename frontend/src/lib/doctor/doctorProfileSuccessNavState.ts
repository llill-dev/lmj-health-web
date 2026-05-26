export type DoctorProfileSuccessNavState = {
  flow: 'personal_updated';
  redirectTo?: string;
};

const STORAGE_KEY = 'lmj:doctor-profile-success-nav-state';

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
    const parsed = JSON.parse(raw) as DoctorProfileSuccessNavState;
    if (parsed?.flow !== 'personal_updated') return null;
    return parsed;
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
  if (!raw || typeof raw !== 'object' || !('flow' in raw)) return null;
  const state = raw as DoctorProfileSuccessNavState;
  return state.flow === 'personal_updated' ? state : null;
}
