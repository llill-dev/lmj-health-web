import type { FacilityType } from '@/lib/admin/types';

export type DoctorFacilityStatus = 'active' | 'pending' | 'closed';

export type DoctorFacility = {
  id: string;
  name: string;
  facilityType: FacilityType;
  description?: string;
  city: string;
  address: string;
  phone: string;
  status: DoctorFacilityStatus;
  attributes?: string[];
  /** False when linked via PATCH assign to a catalog facility the doctor does not own. */
  isOwned?: boolean;
};

export type DoctorFacilityFormValues = {
  name: string;
  facilityType: FacilityType;
  description?: string;
  city: string;
  address: string;
  phone: string;
  attributes?: string[];
};

export const FACILITY_STATUS_LABELS: Record<DoctorFacilityStatus, string> = {
  active: 'نشط',
  pending: 'قيد المراجعة',
  closed: 'غير نشط',
};

export const DEFAULT_FACILITY_TYPE_OPTIONS: Array<{
  value: FacilityType;
  label: string;
}> = [
  { value: 'clinic', label: 'عيادة' },
  { value: 'hospital', label: 'مستشفى' },
  { value: 'polyclinic', label: 'عيادات متعددة' },
  { value: 'medical_center', label: 'مركز طبي' },
  { value: 'laboratory', label: 'مختبر' },
  { value: 'imaging_center', label: 'مركز أشعة' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'rehabilitation_center', label: 'مركز تأهيل' },
  { value: 'dialysis_center', label: 'مركز غسيل كلوي' },
  { value: 'emergency_center', label: 'طوارئ' },
  { value: 'other', label: 'أخرى' },
];
