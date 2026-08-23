import type { AppointmentSummary } from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';

const SPECIALIZATION_LABEL: Record<string, { ar: string; en: string }> = {
  Cardiology: { ar: 'القلب', en: 'Cardiology' },
  Dermatology: { ar: 'الجلدية', en: 'Dermatology' },
  Pediatrics: { ar: 'الأطفال', en: 'Pediatrics' },
  Neurology: { ar: 'الأعصاب', en: 'Neurology' },
  Orthopedics: { ar: 'العظام', en: 'Orthopedics' },
  Gynecology: { ar: 'النساء والتوليد', en: 'Gynecology' },
  Ophthalmology: { ar: 'العيون', en: 'Ophthalmology' },
  Urology: { ar: 'المسالك البولية', en: 'Urology' },
  Psychiatry: { ar: 'الطب النفسي', en: 'Psychiatry' },
  'Internal Medicine': { ar: 'الباطنة', en: 'Internal Medicine' },
  Surgery: { ar: 'الجراحة', en: 'Surgery' },
  Oncology: { ar: 'الأورام', en: 'Oncology' },
  Endocrinology: { ar: 'الغدد', en: 'Endocrinology' },
  Pulmonology: { ar: 'الرئة', en: 'Pulmonology' },
  Gastroenterology: { ar: 'الجهاز الهضمي', en: 'Gastroenterology' },
};

export function localizeSpec(spec: string | undefined, locale: AppLocale): string {
  if (!spec) return '—';
  return SPECIALIZATION_LABEL[spec]?.[locale] ?? spec;
}

const STATUS_LABEL_MAP: Record<AppointmentSummary['status'], { ar: string; en: string }> = {
  scheduled: { ar: 'مجدول', en: 'Scheduled' },
  rescheduled: { ar: 'معاد جدولته', en: 'Rescheduled' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  cancelled: { ar: 'ملغى', en: 'Cancelled' },
  'no-show': { ar: 'غياب', en: 'No-show' },
};

export function statusLabel(status: AppointmentSummary['status'], locale: AppLocale): string {
  return STATUS_LABEL_MAP[status]?.[locale] ?? status;
}

/** @deprecated use statusLabel(status, locale) — kept for any remaining direct lookups. */
export const STATUS_LABEL: Record<AppointmentSummary['status'], string> = {
  scheduled: STATUS_LABEL_MAP.scheduled.ar,
  rescheduled: STATUS_LABEL_MAP.rescheduled.ar,
  completed: STATUS_LABEL_MAP.completed.ar,
  cancelled: STATUS_LABEL_MAP.cancelled.ar,
  'no-show': STATUS_LABEL_MAP['no-show'].ar,
};

export const STATUS_COLOR: Record<AppointmentSummary['status'], string> = {
  scheduled: 'bg-[#E0F2FE] text-[#0369A1]',
  rescheduled: 'bg-[#FEF9C3] text-[#854D0E]',
  completed: 'bg-[#DCFCE7] text-[#15803D]',
  cancelled: 'bg-[#FEE2E2] text-[#B91C1C]',
  'no-show': 'bg-[#F3F4F6] text-[#6B7280]',
};

export function formatDateTime(appt: AppointmentSummary, locale: AppLocale = 'ar'): string {
  const raw = appt.startDateTime ?? appt.date;
  if (!raw) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}
