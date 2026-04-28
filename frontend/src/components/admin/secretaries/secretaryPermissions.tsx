import type { ElementType } from 'react';
import { CalendarDays, Settings, Users } from 'lucide-react';

export type SecretaryPermissionGroup = {
  label: string;
  icon: ElementType;
  keys: string[];
  color: string;
  bg: string;
  border: string;
};

export const PERM_GROUPS: SecretaryPermissionGroup[] = [
  {
    label: 'المواعيد',
    icon: CalendarDays,
    keys: ['appointments:book', 'appointments:view', 'appointments:edit', 'appointments:cancel'],
    color: 'text-[#0369A1]',
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
  },
  {
    label: 'قائمة الانتظار',
    icon: Users,
    keys: ['waitlist:create', 'waitlist:view', 'waitlist:manage', 'waitlist:book'],
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#C4B5FD]',
  },
  {
    label: 'المرضى',
    icon: Users,
    keys: ['patients:view', 'patients:edit', 'patients:temporary:create', 'patients:files:view', 'patients:files:upload'],
    color: 'text-[#15803D]',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#86EFAC]',
  },
  {
    label: 'الجدول',
    icon: Settings,
    keys: ['schedule:view'],
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
  },
];

export const PERM_LABEL: Record<string, string> = {
  'appointments:book': 'حجز مواعيد',
  'appointments:view': 'عرض المواعيد',
  'appointments:edit': 'تعديل المواعيد',
  'appointments:cancel': 'إلغاء المواعيد',
  'waitlist:create': 'إنشاء قائمة الانتظار',
  'waitlist:view': 'عرض قائمة الانتظار',
  'waitlist:manage': 'إدارة قائمة الانتظار',
  'waitlist:book': 'حجز من قائمة الانتظار',
  'patients:view': 'عرض المرضى',
  'patients:edit': 'تعديل بيانات المرضى',
  'patients:temporary:create': 'إنشاء مريض مؤقت',
  'patients:files:view': 'عرض ملفات المرضى',
  'patients:files:upload': 'رفع ملفات المرضى',
  'schedule:view': 'عرض الجدول',
};
