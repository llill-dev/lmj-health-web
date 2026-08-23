import type { PatientAccountStatus } from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

const STATUS_KEYS: Record<PatientAccountStatus, string> = {
  active: 'common.active',
  temporary: 'adminPatients.status.temporary',
  suspended: 'adminPatients.status.suspended',
  locked: 'adminPatients.status.locked',
};

export function patientStatusLabel(status: PatientAccountStatus, locale: AppLocale = 'ar'): string {
  return getTranslationValue(locale, STATUS_KEYS[status]) ?? status;
}

export function patientStatusTone(s: PatientAccountStatus) {
  if (s === 'active') {
    return {
      chip: 'bg-[#16A34A] text-white',
    };
  }
  if (s === 'temporary') {
    return {
      chip: 'bg-[#E0F2FE] text-[#0284C7]',
    };
  }
  if (s === 'suspended') {
    return {
      chip: 'bg-[#F59E0B] text-white',
    };
  }
  return {
    chip: 'bg-[#EF4444] text-white',
  };
}
