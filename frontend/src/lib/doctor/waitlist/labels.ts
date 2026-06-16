import type { WaitlistStatus, WaitlistUrgency } from '@/lib/doctor/waitlist/types';

export function waitlistStatusLabel(status?: string): string {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'contacted':
      return 'تم التواصل';
    case 'booked':
      return 'محجوز';
    case 'closed':
      return 'مغلق';
    case 'cancelled':
      return 'ملغى';
    case 'expired':
      return 'منتهي';
    default:
      return status?.trim() || '—';
  }
}

export function waitlistUrgencyLabel(urgency?: string): string {
  switch (urgency) {
    case 'high':
      return 'عاجل';
    case 'medium':
      return 'متوسط';
    case 'low':
      return 'منخفض';
    default:
      return urgency?.trim() || '—';
  }
}

export function isWaitlistActionable(status?: string): boolean {
  return status === 'active' || status === 'contacted';
}

export const WAITLIST_STATUS_TABS: Array<{
  value: 'all' | WaitlistStatus;
  label: string;
}> = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'booked', label: 'محجوز' },
  { value: 'closed', label: 'مغلق' },
];
