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

function isFacilityType(value: string): value is FacilityType {
  return Object.values(MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES)
    .flat()
    .some((facilityType) => facilityType === value);
}

export function resolveMedicalServiceCategory(
  facilityType?: string | null,
): MedicalServiceCategory | null {
  const normalized = facilityType?.trim().toLowerCase();
  if (!normalized) return null;

  const entries: Array<[MedicalServiceCategory, FacilityType[]]> = [
    ['clinics', MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES.clinics],
    ['imaging', MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES.imaging],
    ['treatment', MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES.treatment],
    ['labs', MEDICAL_SERVICE_CATEGORY_FACILITY_TYPES.labs],
  ];

  for (const [category, types] of entries) {
    if (isFacilityType(normalized) && types.includes(normalized)) return category;
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
