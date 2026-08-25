import type { WaitlistStatus, WaitlistUrgency } from '@/lib/doctor/waitlist/types';

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

export function waitlistStatusLabel(status?: string, tr: TrFn = defaultTr): string {
  switch (status) {
    case 'active':
      return tr('نشط', 'Active');
    case 'contacted':
      return tr('تم التواصل', 'Contacted');
    case 'booked':
      return tr('محجوز', 'Booked');
    case 'closed':
      return tr('مغلق', 'Closed');
    case 'cancelled':
      return tr('ملغى', 'Cancelled');
    case 'expired':
      return tr('منتهي', 'Expired');
    default:
      return status?.trim() || '—';
  }
}

export function waitlistUrgencyLabel(urgency?: string, tr: TrFn = defaultTr): string {
  switch (urgency) {
    case 'high':
      return tr('عاجل', 'Urgent');
    case 'medium':
      return tr('متوسط', 'Medium');
    case 'low':
      return tr('منخفض', 'Low');
    default:
      return urgency?.trim() || '—';
  }
}

export function isWaitlistActionable(status?: string): boolean {
  return status === 'active' || status === 'contacted';
}

export function buildWaitlistStatusTabs(
  tr: TrFn = defaultTr,
): Array<{ value: 'all' | WaitlistStatus; label: string }> {
  return [
    { value: 'all', label: tr('الكل', 'All') },
    { value: 'active', label: tr('نشط', 'Active') },
    { value: 'contacted', label: tr('تم التواصل', 'Contacted') },
    { value: 'booked', label: tr('محجوز', 'Booked') },
    { value: 'closed', label: tr('مغلق', 'Closed') },
  ];
}
