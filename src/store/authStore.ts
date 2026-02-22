import { useSyncExternalStore } from 'react';
import { get, post } from '@/lib/base';

interface User {
  id: string;
  email: string;
  phone: string;
  role: 'jobseeker' | 'company' | 'admin';
  name?: string;
  verified: boolean;
}
interface UserProfile {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  stats: {
    profileViews: number;
    applicationsCount: number;
    savedJobsCount: number;
  };
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  // General/settings
  platformName: string;
  primaryEmail: string;
  phone: string;
  region: string;
  lang: 'ar' | 'en';
  loadProfile: () => Promise<void>;
  loadGeneralSettings: () => Promise<void>;
  saveGeneralSettings: (payload: {
    platformName: string;
    primaryEmail: string;
    phone: string;
    region: string;
    lang?: 'ar' | 'en';
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'jobseeker' | 'company',
  ) => Promise<void>;
  logout: () => void;
  setAuth: (payload: {
    user: Partial<User> & {
      id: string;
      verified: boolean;
      role?: any;
      email?: string;
      phone?: string;
    };
    token: string;
  }) => void;
}

type Listener = () => void;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPersistedToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function writePersistedToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem('token');
    else localStorage.setItem('token', token);
  } catch {}
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
      platformName: saved.platformName ?? 'JobFind',
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

let state: AuthState = {
  user: null,
  userProfile: null,
  token: null,
  isAuthenticated: false,
  platformName: 'JobFind',
  primaryEmail: '',
  phone: '',
  region: '',
  lang: 'ar',
  loadProfile: async () => {
    const data = await get<UserProfile>('/api/profile', { locale: 'ar' });
    setState({ userProfile: data });
  },
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
      platformName: data.platformName || 'JobFind',
      primaryEmail: data.primaryEmail || '',
      phone: data.phone || '',
      region: data.region || '',
      lang: (data.lang as any) || 'ar',
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

      const s = (data as any)?.settings || payload;
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
  login: async () => {},
  register: async () => {},
  logout: () => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      userProfile: null,
    });
    writePersistedToken(null);
    try {
      localStorage.removeItem('userRole');
    } catch {}
  },
  setAuth: ({ user, token }) => {
    const mappedRole =
      (user as any).role === 'candidate' ? 'jobseeker' : (user as any).role;

    setState({
      user: {
        id: user.id,
        email: (user.email as any) || '',
        phone: (user.phone as any) || '',
        role: (mappedRole as any) || 'jobseeker',
        verified: user.verified,
        name: (user as any).name,
      },
      token,
      isAuthenticated: true,
    });

    writePersistedToken(token);
    try {
      localStorage.setItem('userRole', String(mappedRole));
    } catch {}
  },
};

const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function initFromStorage() {
  const token = typeof window !== 'undefined' ? readPersistedToken() : null;
  const settings =
    typeof window !== 'undefined' ? readPersistedGeneralSettings() : null;

  if (token) {
    state = {
      ...state,
      token,
      isAuthenticated: true,
    };
  }

  if (settings) {
    state = {
      ...state,
      ...settings,
    };
  }
}

if (typeof window !== 'undefined') {
  initFromStorage();
}

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
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
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
