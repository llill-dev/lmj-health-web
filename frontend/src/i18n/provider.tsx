import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  directionForLocale,
  getCurrentLocale,
  resolveInitialLocale,
  setCurrentLocale,
  type AppDirection,
  type AppLocale,
} from "@/i18n/runtime";
import { getTranslationValue } from "@/i18n/translations";

type I18nContextValue = {
  locale: AppLocale;
  dir: AppDirection;
  setLocale: (next: AppLocale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => resolveInitialLocale());

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    const synced = getCurrentLocale();
    if (synced !== locale) setLocaleState(synced);
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      getTranslationValue(locale, key) ?? fallback ?? key,
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: directionForLocale(locale),
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
