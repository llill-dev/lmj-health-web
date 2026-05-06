import { useSyncExternalStore } from 'react';
import { get, post } from '@/lib/base';
import { authApi } from '@/lib/auth/client';
import {
  readAuthToken,
  writeAuthToken,
  clearAuthToken,
  readAuthUser,
  writeAuthUser,
  clearAllAuthCookies,
} from '@/lib/cookies';
import type { LoginRequest, AuthError } from '@/lib/auth/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'patient' | 'secretary' | 'data-entry' | 'doctor' | 'admin';
  name?: string;
  verified: boolean;
}

interface PendingVerification {
  userId: string;
  role: User['role'];
  email: string;
  phone: string;
  channel: 'email' | 'whatsapp';
}

const PENDING_VERIFICATION_KEY = 'pendingSignupVerification';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  pendingVerification: PendingVerification | null;
  // Platform / general settings
  platformName: string;
  primaryEmail: string;
  phone: string;
  region: string;
  lang: 'ar' | 'en';
  // Actions
  loadGeneralSettings: () => Promise<void>;
  saveGeneralSettings: (payload: {
    platformName: string;
    primaryEmail: string;
    phone: string;
    region: string;
    lang?: 'ar' | 'en';
  }) => Promise<void>;
  login: (
    identifier: string,
    password: string,
    clientType?: 'web' | 'patient_mobile' | 'doctor_mobile',
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'jobseeker' | 'company' | 'doctor',
  ) => Promise<void>;
  setPendingVerification: (payload: PendingVerification | null) => void;
  logout: (options?: { skipRemoteRevoke?: boolean }) => Promise<void>;
}

type Listener = () => void;

export class AuthFlowError extends Error {
  readonly code: string;
  readonly authError?: AuthError;

  constructor(authError: AuthError) {
    super(authError.message);
    this.name = 'AuthFlowError';
    this.code = authError.code;
    this.authError = authError;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers (used only for non-sensitive settings)
// ─────────────────────────────────────────────────────────────────────────────

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPersistedGeneralSettings(): Partial<AuthState> | null {
  try {
    const saved = safeJsonParse<{
      platformName?: string;
      primaryEmail?: string;
      phone?: string;
      region?: string;
      lang?: 'ar' | 'en';
    }>(localStorage.getItem('generalSettings'));

    if (!saved) return null;
    return {
      platformName: saved.platformName ?? 'LMJ Health',
      primaryEmail: saved.primaryEmail ?? '',
      phone: saved.phone ?? '',
      region: saved.region ?? '',
      lang: saved.lang ?? 'ar',
    } as Partial<AuthState>;
  } catch {
    return null;
  }
}

function writePersistedGeneralSettings(payload: {
  platformName: string;
  primaryEmail: string;
  phone: string;
  region: string;
  lang?: 'ar' | 'en';
}) {
  try {
    localStorage.setItem('generalSettings', JSON.stringify(payload));
  } catch {}
}

function readPendingVerification(): PendingVerification | null {
  if (typeof window === 'undefined') return null;
  let parsed: PendingVerification | null = null;
  try {
    parsed = safeJsonParse<PendingVerification>(
      sessionStorage.getItem(PENDING_VERIFICATION_KEY),
    );
  } catch {
    return null;
  }

  if (
    !parsed?.userId ||
    !parsed.role ||
    !parsed.email ||
    !parsed.phone ||
    !['email', 'whatsapp'].includes(parsed.channel)
  ) {
    return null;
  }

  return parsed;
}

function writePendingVerification(payload: PendingVerification | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!payload) {
      sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
      return;
    }
    sessionStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(payload));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Build User from the persisted cookie data
// ─────────────────────────────────────────────────────────────────────────────

function buildUserFromCookie(): User | null {
  const data = readAuthUser();
  if (!data) return null;
  return {
    id: data.userId,
    email: data.email ?? '',
    phone: data.phone ?? '',
    role: (data.role === 'data_entry' ? 'data-entry' : data.role) as User['role'],
    name: data.fullName,
    verified: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

let state: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  pendingVerification: null,
  platformName: 'LMJ Health',
  primaryEmail: '',
  phone: '',
  region: '',
  lang: 'ar',

  loadGeneralSettings: async () => {
    const persisted = readPersistedGeneralSettings();
    if (persisted) {
      setState(persisted);
      return;
    }

    const data = await get<{
      platformName: string;
      primaryEmail: string;
      phone: string;
      region: string;
      lang?: 'ar' | 'en';
    }>('/api/admin/settings/general', { locale: 'ar' });

    setState({
      platformName: data.platformName || 'LMJ Health',
      primaryEmail: data.primaryEmail || '',
      phone: data.phone || '',
      region: data.region || '',
      lang: (data.lang as 'ar' | 'en' | undefined) || 'ar',
    });
  },

  saveGeneralSettings: async (payload) => {
    try {
      const data = await post<{
        ok: boolean;
        settings?: {
          platformName: string;
          primaryEmail: string;
          phone: string;
          region: string;
          lang?: 'ar' | 'en';
        };
      }>('/api/admin/settings/general', payload, { locale: 'ar' });

      const s = (data as { settings?: typeof payload })?.settings ?? payload;
      setState({
        platformName: s.platformName,
        primaryEmail: s.primaryEmail,
        phone: s.phone,
        region: s.region,
        lang: s.lang || 'ar',
      });

      writePersistedGeneralSettings(s);
    } catch {
      return;
    }
  },

  login: async (
    identifier: string,
    password: string,
    clientType: 'web' | 'patient_mobile' | 'doctor_mobile' = 'web',
  ) => {
    const loginRequest: LoginRequest = {
      email: identifier.includes('@') ? identifier : undefined,
      phone: identifier.includes('@') ? undefined : identifier,
      password,
      clientType,
    };

    const result = await authApi.login(loginRequest);

    if ('error' in result) {
      throw new AuthFlowError(result.error);
    }

    const { data } = result;

    const mappedUser: User = {
      id: data.userId,
      email: data.email ?? '',
      phone: data.phone ?? '',
      role: (data.role === 'data_entry' ? 'data-entry' : data.role) as User['role'],
      verified: data.accountStatus === 'active',
      name: data.fullName,
    };

    setState({
      user: mappedUser,
      token: data.token,
      isAuthenticated: true,
      pendingVerification: null,
    });
    writePendingVerification(null);

    // ── Persist to cookies (replaces localStorage for sensitive auth data) ──
    writeAuthToken(data.token);
    writeAuthUser({
      userId: data.userId,
      role: data.role,
      fullName: data.fullName,
      email: data.email ?? '',
      phone: data.phone ?? '',
      actorIds: data.actorIds as Record<string, string | undefined>,
      patientPublicId: data.patientPublicId,
    });

    // Legacy localStorage keys removed — cookies are the single source of truth.
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
    } catch {}
  },

  register: async () => {},

  setPendingVerification: (payload) => {
    writePendingVerification(payload);
    setState({ pendingVerification: payload });
  },

  logout: async (options?: { skipRemoteRevoke?: boolean }) => {
    const token = state.token;

    if (token && !options?.skipRemoteRevoke) {
      try {
        await authApi.logoutAll(token);
      } catch (err) {
        console.warn('Logout API failed — continuing local logout:', err);
      }
    }

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingVerification: null,
    });

    // Clear all auth cookies (token + user).
    clearAllAuthCookies();

    // Also clear any legacy localStorage keys that may still exist.
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
    } catch {}
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Store internals
// ─────────────────────────────────────────────────────────────────────────────

const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialise from cookies on app start (replaces initFromStorage)
// ─────────────────────────────────────────────────────────────────────────────

function initFromCookies() {
  if (typeof window === 'undefined') return;

  const token = readAuthToken();
  const user = buildUserFromCookie();
  const settings = readPersistedGeneralSettings();
  const pendingVerification = readPendingVerification();

  if (token) {
    state = {
      ...state,
      token,
      isAuthenticated: true,
      // Restore full User object so ProtectedRoute can read role immediately
      // after a page refresh — no /me round-trip needed.
      ...(user ? { user } : {}),
    };
  }

  if (settings) {
    state = { ...state, ...settings };
  }

  if (pendingVerification && !token) {
    state = { ...state, pendingVerification };
  }
}

initFromCookies();

// ─────────────────────────────────────────────────────────────────────────────
// Public hook
// ─────────────────────────────────────────────────────────────────────────────

type StoreHook = {
  <T>(selector: (s: AuthState) => T): T;
  (): AuthState;
  getState: () => AuthState;
  setState: (patch: Partial<AuthState>) => void;
  subscribe: (listener: Listener) => () => void;
};

export const useAuthStore: StoreHook = ((
  selector?: (s: AuthState) => unknown,
) => {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => (selector ? selector(state) : state),
    () => (selector ? selector(state) : state),
  );
}) as StoreHook;

useAuthStore.getState = () => state;
useAuthStore.setState = (patch) => setState(patch);
useAuthStore.subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
