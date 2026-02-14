import { create } from 'zustand';
// Middleware to automatically save state in localStorage
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
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
    role: 'jobseeker' | 'company'
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

export const useAuthStore = create<AuthState>()(
  // Middleware to automatically save state in localStorage
  persist(
    (set) => ({
      user: null,
      userProfile: null,
      token: null,
      isAuthenticated: false,
      // Defaults for settings
      platformName: 'JobFind',
      primaryEmail: '',
      phone: '',
      region: '',
      lang: 'ar',
      loadProfile: async () => {
        const data = await get<UserProfile>('/api/profile', { locale: 'ar' });
        set({ userProfile: data });
      },
      loadGeneralSettings: async () => {
        try {
          const saved = Cookies.get('generalSettings');
          if (saved) {
            const s = JSON.parse(saved);
            set({
              platformName: s.platformName || 'JobFind',
              primaryEmail: s.primaryEmail || '',
              phone: s.phone || '',
              region: s.region || '',
              lang: (s.lang as any) || 'ar',
            });
            return;
          }
        } catch {}
        const data = await get<{
          platformName: string;
          primaryEmail: string;
          phone: string;
          region: string;
          lang?: 'ar' | 'en';
        }>('/api/admin/settings/general', { locale: 'ar' });
        set({
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
          set({
            platformName: s.platformName,
            primaryEmail: s.primaryEmail,
            phone: s.phone,
            region: s.region,
            lang: s.lang || 'ar',
          });
          try {
            Cookies.set('generalSettings', JSON.stringify(s), { expires: 30 });
          } catch {}
        } catch (e) {
          // Best-effort: let UI handle errors
          return;
        }
      },
      login: async (email, password) => {},
      register: async (email, password, role) => {},

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userProfile: null,
          // keep settings persisted
        });
        Cookies.remove('token');
        Cookies.remove('userRole');
      },
      setAuth: ({ user, token }) => {
        // Map role from 'candidate' to 'jobseeker' if needed
        const mappedRole =
          (user as any).role === 'candidate' ? 'jobseeker' : (user as any).role;
        set({
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
        try {
          // localStorage.setItem('token', token);
          Cookies.set('token', token, { expires: 7 }); // expires after 7 days
          Cookies.set('userRole', mappedRole, { expires: 7 });
        } catch {}
      },
    }),
    { name: 'auth-storage' } // يحفظ في localStorage تلقائي
  )
);
