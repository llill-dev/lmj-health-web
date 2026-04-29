import {
  Building2,
  FlaskConical,
  Hospital,
  Pill,
  Stethoscope,
} from 'lucide-react';
import type { ElementType } from 'react';
import type { FacilityType } from '@/lib/admin/services/types';

export type Tab =
  | { kind: 'facility'; type: FacilityType; label: string; icon: ElementType }
  | { kind: 'service-types'; label: string; icon: ElementType };

export const ADMIN_SERVICES_TABS: Tab[] = [
  { kind: 'facility', type: 'hospital', label: 'المشافي', icon: Hospital },
  {
    kind: 'facility',
    type: 'laboratory',
    label: 'المخابر',
    icon: FlaskConical,
  },
  { kind: 'facility', type: 'pharmacy', label: 'الصيدليات', icon: Pill },
  {
    kind: 'facility',
    type: 'imaging_center',
    label: 'مراكز الأشعة',
    icon: Building2,
  },
  { kind: 'service-types', label: 'أنواع الخدمات', icon: Stethoscope },
];

export const ADMIN_SERVICES_PAGE_SIZE = 10;
