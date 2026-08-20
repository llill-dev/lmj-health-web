import type { PatientAccountStatus } from '@/lib/admin/types';

export const patientStatusLabel: Record<PatientAccountStatus, string> = {
  active: 'نشط',
  temporary: 'مؤقت',
  suspended: 'معلق',
  locked: 'موقوف',
};

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
