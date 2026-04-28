import type {
  AdminComplaintListItem,
  ComplaintLifecycleStatus,
  ComplaintType,
} from '@/lib/admin/types';

export const COMPLAINT_TYPES: ComplaintType[] = [
  'appointment',
  'consultation',
  'access_request',
  'technical',
  'other',
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

export function formatListTime(iso?: string) {
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

export function listPreviewLine(c: AdminComplaintListItem) {
  const sub = c.subject?.trim();
  if (sub) return sub;
  if (c.message.length > 100) return `${c.message.slice(0, 100)}…`;
  return c.message;
}
