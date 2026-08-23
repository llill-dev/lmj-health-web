import type {
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';

export const STATUS_OPTIONS: ComplaintLifecycleStatus[] = [
  'submitted',
  'under_review',
  'in_progress',
  'resolved',
  'closed',
];

const TYPE_LABEL: Record<ComplaintType, { ar: string; en: string }> = {
  appointment: { ar: 'موعد', en: 'Appointment' },
  consultation: { ar: 'استشارة', en: 'Consultation' },
  access_request: { ar: 'طلب وصول', en: 'Access request' },
  technical: { ar: 'تقني', en: 'Technical' },
  other: { ar: 'أخرى', en: 'Other' },
};

export function complaintTypeAr(t: ComplaintType, locale: AppLocale = 'ar'): string {
  return TYPE_LABEL[t]?.[locale] ?? t;
}

const STATUS_LABEL: Record<ComplaintLifecycleStatus, { ar: string; en: string }> = {
  submitted: { ar: 'مقدّمة', en: 'Submitted' },
  under_review: { ar: 'قيد المراجعة', en: 'Under review' },
  in_progress: { ar: 'قيد المعالجة', en: 'In progress' },
  resolved: { ar: 'تم الحل', en: 'Resolved' },
  closed: { ar: 'مغلقة', en: 'Closed' },
};

export function statusLabelAr(s: ComplaintLifecycleStatus, locale: AppLocale = 'ar'): string {
  return STATUS_LABEL[s]?.[locale] ?? s;
}

export function formatHeaderTime(iso: string | undefined, locale: AppLocale = 'ar', todayLabel = 'اليوم') {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const dateLocale = locale === 'ar' ? 'ar-SY' : 'en-US';
  const time = d.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return sameDay ? `${todayLabel} ${time}` : d.toLocaleDateString(dateLocale);
}

export function formatDateTime(iso: string | undefined, locale: AppLocale = 'ar') {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale === 'ar' ? 'ar-SY' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function detailContextLine(subject?: string, message?: string) {
  const s = subject?.trim();
  if (s) return s;
  if (!message) return '—';
  const oneLine = message.replace(/\s+/g, ' ').trim();
  if (oneLine.length > 120) return `${oneLine.slice(0, 120)}…`;
  return oneLine;
}
