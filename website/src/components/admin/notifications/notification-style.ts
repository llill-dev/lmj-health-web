import type { AdminNotificationKind } from './types';

/** ألوان الشريط العمودي على يسار البطاقة (إحداثيات الشاشة) */
export function stripeColor(kind: AdminNotificationKind): string {
  switch (kind) {
    case 'appointment':
    case 'message':
    case 'access-request':
      return '#0F8F8B';
    case 'reminder':
      return '#F59E0B';
    case 'cancel':
      return '#EF4444';
    case 'record':
      return '#2563EB';
    default:
      return '#0F8F8B';
  }
}

/** خلفية حاوية الأيقونة الباهتة بما يتوافق مع نوع الإشعار */
export function iconBoxClass(kind: AdminNotificationKind): string {
  switch (kind) {
    case 'appointment':
    case 'message':
    case 'access-request':
      return 'bg-[#E6F4F3] text-primary';
    case 'reminder':
      return 'bg-[#FFFBEB] text-[#D97706]';
    case 'cancel':
      return 'bg-[#FEF2F2] text-[#DC2626]';
    case 'record':
      return 'bg-[#EFF6FF] text-[#2563EB]';
    default:
      return 'bg-[#E6F4F3] text-primary';
  }
}
