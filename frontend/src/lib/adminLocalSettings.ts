/**
 * إعدادات واجهة المسؤول المخزّنة محلياً (localStorage) لتبقى بعد refresh.
 * نبثّ `admin-local-settings-changed` بعد كل حفظ ليُحدّث نفس النافذة (السايدبار) فوراً.
 */
export const ADMIN_LOCAL_SETTINGS_KEY = 'admin.settings.v1';

export const ADMIN_LOCAL_SETTINGS_CHANGED = 'admin-local-settings-changed';

export type AdminLocalSettings = {
  general: {
    appName: string;
    appDescription: string;
  };
  logo: {
    initials: string;
    dataUrl: string | null;
  };
  notifications: {
    appointments: boolean;
    registrations: boolean;
    requests: boolean;
  };
};

export const DEFAULT_ADMIN_LOCAL_SETTINGS: AdminLocalSettings = {
  general: {
    appName: 'LMJ HEALTH',
    appDescription: 'منصة طبية متكاملة',
  },
  logo: {
    initials: 'LMJ',
    dataUrl: null,
  },
  notifications: {
    appointments: true,
    registrations: true,
    requests: true,
  },
};

export function loadAdminLocalSettings(): AdminLocalSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_LOCAL_SETTINGS;

  try {
    const raw = window.localStorage.getItem(ADMIN_LOCAL_SETTINGS_KEY);
    if (!raw) return DEFAULT_ADMIN_LOCAL_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminLocalSettings>;
    return {
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
    };
  } catch {
    return DEFAULT_ADMIN_LOCAL_SETTINGS;
  }
}

export function persistAdminLocalSettings(
  next: AdminLocalSettings,
): AdminLocalSettings {
  if (typeof window === 'undefined') return next;
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(ADMIN_LOCAL_SETTINGS_KEY, serialized);
  window.dispatchEvent(
    new CustomEvent(ADMIN_LOCAL_SETTINGS_CHANGED, { detail: next }),
  );
  return next;
}
