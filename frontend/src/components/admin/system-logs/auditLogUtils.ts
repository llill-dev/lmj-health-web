import type { AppLocale } from '@/i18n/runtime';

export function formatAuditLogDateTime(iso: string, locale: AppLocale = 'ar'): { date: string; time: string } {
  const dateLocale = locale === 'ar' ? 'ar-SY' : 'en-US';
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: iso, time: '' };
  }
}
