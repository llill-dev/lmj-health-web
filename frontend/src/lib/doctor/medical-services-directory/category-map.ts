import type { FacilityType } from '@/lib/admin/types';
import type { MedicalServiceCategory } from '@/lib/doctor/medical-services-directory/types';

export const MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES: Record<
  MedicalServiceCategory,
  FacilityType[]
> = {
  clinics: ['clinic', 'polyclinic', 'medical_center', 'hospital'],
  imaging: ['imaging_center'],
  treatment: [
    'rehabilitation_center',
    'dialysis_center',
    'emergency_center',
    'medical_center',
  ],
  labs: ['laboratory'],
};

export function resolveMedicalServiceCategory(
  facilityType?: string | null,
): MedicalServiceCategory | null {
  const normalized = facilityType?.trim().toLowerCase();
  if (!normalized) return null;

  for (const [category, types] of Object.entries(
    MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES,
  ) as Array<[MedicalServiceCategory, FacilityType[]]>) {
    if (types.includes(normalized as FacilityType)) return category;
  }

  return null;
}
