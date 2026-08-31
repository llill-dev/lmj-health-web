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
  /**
   * الوسيط الثاني إمّا نص احتياطي (fallback) عند غياب المفتاح، أو كائن قيم
   * يُستبدل مكان {placeholders} داخل نص الترجمة (مثال: "{count} طلب").
   */
  t: (key: string, paramsOrFallback?: Record<string, unknown> | string) => string;
};

function interpolateTranslation(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value != null ? String(value) : match;
  });
}

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
    (key: string, paramsOrFallback?: Record<string, unknown> | string) => {
      const raw = getTranslationValue(locale, key);
      if (typeof paramsOrFallback === "string") {
        return raw ?? paramsOrFallback;
      }
      const template = raw ?? key;
      return paramsOrFallback
        ? interpolateTranslation(template, paramsOrFallback)
        : template;
    },
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
