'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ADMIN_LOCAL_SETTINGS_KEY,
  ADMIN_LOCAL_SETTINGS_CHANGED,
  type AdminLocalSettings,
  DEFAULT_ADMIN_LOCAL_SETTINGS,
  loadAdminLocalSettings,
  persistAdminLocalSettings,
} from '@/lib/adminLocalSettings';

type Ctx = {
  settings: AdminLocalSettings;
  setSettings: (
    u: AdminLocalSettings | ((prev: AdminLocalSettings) => AdminLocalSettings),
  ) => void;
  /** دمج general ثم حفظ (بعد التأكيد في الصفحة) */
  applyGeneral: (g: { appName: string; appDescription: string }) => void;
};

const AdminAppSettingsContext = createContext<Ctx | null>(null);

export function AdminAppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AdminLocalSettings>(() =>
    loadAdminLocalSettings(),
  );

  const setSettings = useCallback(
    (
      u: AdminLocalSettings | ((prev: AdminLocalSettings) => AdminLocalSettings),
    ) => {
      setSettingsState((prev) => {
        const next = typeof u === 'function' ? u(prev) : u;
        persistAdminLocalSettings(next);
        return next;
      });
    },
    [],
  );

  const applyGeneral = useCallback(
    (g: { appName: string; appDescription: string }) => {
      setSettingsState((prev) => {
        const name = g.appName.trim() || DEFAULT_ADMIN_LOCAL_SETTINGS.general.appName;
        const desc =
          g.appDescription.trim() || DEFAULT_ADMIN_LOCAL_SETTINGS.general.appDescription;
        const initials = name.slice(0, 3).toUpperCase() || 'LMJ';
        const next: AdminLocalSettings = {
          ...prev,
          general: { appName: name, appDescription: desc },
          logo: prev.logo.dataUrl
            ? prev.logo
            : { ...prev.logo, initials },
        };
        persistAdminLocalSettings(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ADMIN_LOCAL_SETTINGS_KEY) return;
      if (e.newValue) {
        try {
          const parsed = JSON.parse(
            e.newValue,
          ) as Partial<AdminLocalSettings>;
          setSettingsState({
            general: {
              ...DEFAULT_ADMIN_LOCAL_SETTINGS.general,
              ...(parsed.general ?? {}),
            },
            logo: {
              ...DEFAULT_ADMIN_LOCAL_SETTINGS.logo,
              ...(parsed.logo ?? {}),
            },
            notifications: {
              ...DEFAULT_ADMIN_LOCAL_SETTINGS.notifications,
              ...(parsed.notifications ?? {}),
            },
          });
        } catch {
          setSettingsState(loadAdminLocalSettings());
        }
      } else {
        setSettingsState(DEFAULT_ADMIN_LOCAL_SETTINGS);
      }
    };

    const onLocal = () => {
      setSettingsState(loadAdminLocalSettings());
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(ADMIN_LOCAL_SETTINGS_CHANGED, onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ADMIN_LOCAL_SETTINGS_CHANGED, onLocal);
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({ settings, setSettings, applyGeneral }),
    [settings, setSettings, applyGeneral],
  );

  return (
    <AdminAppSettingsContext.Provider value={value}>
      {children}
    </AdminAppSettingsContext.Provider>
  );
}

export function useAdminAppSettings(): Ctx {
  const v = useContext(AdminAppSettingsContext);
  if (!v) {
    throw new Error('useAdminAppSettings must be used within AdminAppSettingsProvider');
  }
  return v;
}

/**
 * للسايدبار: داخل أدمن يعرض من السياق؛ غير ذلك القيم الافتراضية.
 */
export function useAdminBrandingForSidebar(): {
  appName: string;
  appDescription: string;
  logo: AdminLocalSettings['logo'];
} {
  const v = useContext(AdminAppSettingsContext);
  if (v) {
    return {
      appName: v.settings.general.appName,
      appDescription: v.settings.general.appDescription,
      logo: v.settings.logo,
    };
  }
  return {
    appName: DEFAULT_ADMIN_LOCAL_SETTINGS.general.appName,
    appDescription: DEFAULT_ADMIN_LOCAL_SETTINGS.general.appDescription,
    logo: DEFAULT_ADMIN_LOCAL_SETTINGS.logo,
  };
}
