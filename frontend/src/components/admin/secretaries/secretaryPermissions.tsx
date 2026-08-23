import type { ElementType } from 'react';
import { CalendarDays, Settings, Users } from 'lucide-react';
import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

export type SecretaryPermissionGroup = {
  labelKey: string;
  icon: ElementType;
  keys: string[];
  color: string;
  bg: string;
  border: string;
};

export const PERM_GROUPS: SecretaryPermissionGroup[] = [
  {
    labelKey: 'adminSecretaryPermissions.group.appointments',
    icon: CalendarDays,
    keys: ['appointments:book', 'appointments:view', 'appointments:edit', 'appointments:cancel'],
    color: 'text-[#0369A1]',
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
  },
  {
    labelKey: 'adminSecretaryPermissions.group.waitlist',
    icon: Users,
    keys: ['waitlist:create', 'waitlist:view', 'waitlist:manage', 'waitlist:book'],
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#C4B5FD]',
  },
  {
    labelKey: 'adminSecretaryPermissions.group.patients',
    icon: Users,
    keys: ['patients:view', 'patients:temporary:create', 'patients:files:view', 'patients:files:upload'],
    color: 'text-[#15803D]',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#86EFAC]',
  },
  {
    labelKey: 'adminSecretaryPermissions.group.schedule',
    icon: Settings,
    keys: ['schedule:view'],
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
  },
];

const PERM_LABEL_KEY: Record<string, string> = {
  'appointments:book': 'adminSecretaryPermissions.perm.appointments_book',
  'appointments:view': 'adminSecretaryPermissions.perm.appointments_view',
  'appointments:edit': 'adminSecretaryPermissions.perm.appointments_edit',
  'appointments:cancel': 'adminSecretaryPermissions.perm.appointments_cancel',
  'waitlist:create': 'adminSecretaryPermissions.perm.waitlist_create',
  'waitlist:view': 'adminSecretaryPermissions.perm.waitlist_view',
  'waitlist:manage': 'adminSecretaryPermissions.perm.waitlist_manage',
  'waitlist:book': 'adminSecretaryPermissions.perm.waitlist_book',
  'patients:view': 'adminSecretaryPermissions.perm.patients_view',
  'patients:temporary:create': 'adminSecretaryPermissions.perm.patients_temporary_create',
  'patients:files:view': 'adminSecretaryPermissions.perm.patients_files_view',
  'patients:files:upload': 'adminSecretaryPermissions.perm.patients_files_upload',
  'schedule:view': 'adminSecretaryPermissions.perm.schedule_view',
};

export function permLabel(key: string, locale: AppLocale = 'ar'): string {
  const labelKey = PERM_LABEL_KEY[key];
  return labelKey ? (getTranslationValue(locale, labelKey) ?? key) : key;
}
