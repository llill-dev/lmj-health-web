import type {
  AdminComplaintListItem,
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';

export const COMPLAINT_TYPES: ComplaintType[] = [
  'appointment',
  'consultation',
  'access_request',
  'technical',
  'other',
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

export function statusBadgeClasses(status: ComplaintLifecycleStatus) {
  switch (status) {
    case 'resolved':
    case 'closed':
      return 'bg-[#00C950] border-[#00C950] text-white';
    case 'under_review':
    case 'in_progress':
      return 'bg-[#4A5565] border-[#4A5565] text-white';
    case 'submitted':
    default:
      return 'bg-amber-100 border-amber-300 text-amber-950';
  }
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

export function formatListTime(iso: string | undefined, locale: AppLocale = 'ar', todayLabel = 'اليوم') {
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

export function listPreviewLine(c: AdminComplaintListItem) {
  const sub = c.subject?.trim();
  if (sub) return sub;
  if (c.message.length > 100) return `${c.message.slice(0, 100)}…`;
  return c.message;
}
