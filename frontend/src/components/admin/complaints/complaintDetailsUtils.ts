import type {
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';

export const STATUS_OPTIONS: ComplaintLifecycleStatus[] = [
  'submitted',
  'under_review',
  'in_progress',
  'resolved',
  'closed',
];

export function complaintTypeAr(t: ComplaintType): string {
  const m: Record<ComplaintType, string> = {
    appointment: 'موعد',
    consultation: 'استشارة',
    access_request: 'طلب وصول',
    technical: 'تقني',
    other: 'أخرى',
  };
  return m[t] ?? t;
}

export function statusLabelAr(s: ComplaintLifecycleStatus): string {
  const m: Record<ComplaintLifecycleStatus, string> = {
    submitted: 'مقدّمة',
    under_review: 'قيد المراجعة',
    in_progress: 'قيد المعالجة',
    resolved: 'تم الحل',
    closed: 'مغلقة',
  };
  return m[s] ?? s;
}

export function formatHeaderTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('ar-SY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return sameDay ? `اليوم ${time}` : d.toLocaleDateString('ar-SY');
}

export function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-SY', {
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
