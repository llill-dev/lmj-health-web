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

export function resolveMedicalServiceCategoryFromServiceType(
  serviceTypeSlug?: string | null,
  serviceTypeName?: string | null,
): MedicalServiceCategory {
  const normalized = `${serviceTypeSlug ?? ''} ${serviceTypeName ?? ''}`
    .trim()
    .toLowerCase();

  if (
    normalized.includes('lab') ||
    normalized.includes('laboratory') ||
    normalized.includes('مختبر') ||
    normalized.includes('مخبر') ||
    normalized.includes('تحاليل')
  ) {
    return 'labs';
  }

  if (
    normalized.includes('imag') ||
    normalized.includes('radiology') ||
    normalized.includes('scan') ||
    normalized.includes('xray') ||
    normalized.includes('x-ray') ||
    normalized.includes('mri') ||
    normalized.includes('ct') ||
    normalized.includes('ultrasound') ||
    normalized.includes('أشعة') ||
    normalized.includes('تصوير')
  ) {
    return 'imaging';
  }

  if (
    normalized.includes('dialysis') ||
    normalized.includes('rehab') ||
    normalized.includes('therapy') ||
    normalized.includes('treat') ||
    normalized.includes('emergency') ||
    normalized.includes('غسيل') ||
    normalized.includes('تأهيل') ||
    normalized.includes('علاج') ||
    normalized.includes('طوارئ')
  ) {
    return 'treatment';
  }

  return 'clinics';
}
