import type { AdminLocalizedLookupText } from '@/lib/admin/types';

/** يعرض النص المحلي وفق اللغة؛ مع افتراض عربي في لوحة الإدارة. */
export function resolveLookupText(
  text: AdminLocalizedLookupText | undefined | null,
  locale: 'ar' | 'en' = 'ar',
): string {
  if (text == null) return '';
  if (typeof text === 'string') return text.trim();
  const primary = text[locale] ?? text.ar ?? text.en ?? '';
  return String(primary).trim();
}

/** مقطع ثانوي بلغة المكمل للعرض في البطاقة */
export function resolveLookupSecondaryText(
  text: AdminLocalizedLookupText | undefined | null,
  locale: 'ar' | 'en' = 'ar',
): string {
  if (text == null || typeof text === 'string') return '';
  const other = locale === 'ar' ? text.en : text.ar;
  return String(other ?? '').trim();
}
