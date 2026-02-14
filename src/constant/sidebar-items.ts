import {
  Activity,
  BookOpen,
  CalendarDays,
  FileText,
  LayoutGrid,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type SidebarItemId =
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'work-schedule'
  | 'medical-records'
  | 'access-requests'
  | 'doctors-directory'
  | 'clinic-location'
  | 'profile-settings';

export const sidebarItems: Array<{
  id: string;
  path: SidebarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}> = [
  {
    id: 'dashboard',
    path: 'dashboard',
    label: 'لوحة التحكم',
    icon: LayoutGrid,
  },
  {
    id: 'appointments',
    path: 'appointments',
    label: 'المواعيد',
    icon: CalendarDays,
    badge: 3,
  },
  { id: 'patients', path: 'patients', label: 'المرضى', icon: Users },
  {
    id: 'work-schedule',
    path: 'work-schedule',
    label: 'جدول العمل',
    icon: Activity,
  },
  {
    id: 'medical-records',
    path: 'medical-records',
    label: 'السجلات الطبية',
    icon: FileText,
  },
  {
    id: 'access-requests',
    path: 'access-requests',
    label: 'طلبات الوصول',
    icon: ShieldCheck,
  },
  {
    id: 'doctors-directory',
    path: 'doctors-directory',
    label: 'دليل الأطباء',
    icon: BookOpen,
  },
  {
    id: 'clinic-location',
    path: 'clinic-location',
    label: 'موقع العيادة',
    icon: MapPin,
  },
  {
    id: 'profile-settings',
    path: 'profile-settings',
    label: 'الملف الشخصي',
    icon: Settings,
  },
];
