export type AppLocale = "ar" | "en";
export type AppDirection = "rtl" | "ltr";

const STORAGE_KEY = "lmj.app.locale";
let currentLocale: AppLocale = "ar";

function isLocale(value: unknown): value is AppLocale {
  return value === "ar" || value === "en";
}

function detectBrowserLocale(): AppLocale {
  return "ar";
}

export function directionForLocale(locale: AppLocale): AppDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function readPersistedLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : null;
}

export function resolveInitialLocale(): AppLocale {
  const persisted = readPersistedLocale();
  if (persisted) return persisted;

  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.toLowerCase();
    if (isLocale(htmlLang)) return htmlLang;
  }

  // Arabic-first default unless user explicitly chose otherwise.
  return detectBrowserLocale();
}

export function getCurrentLocale(): AppLocale {
  return currentLocale;
}

export function setCurrentLocale(locale: AppLocale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionForLocale(locale);
  }
}

// Initialize immediately for non-React modules (API layer, mappers).
if (typeof window !== "undefined") {
  setCurrentLocale(resolveInitialLocale());
}
