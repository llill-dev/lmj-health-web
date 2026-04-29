import type { AdminLocalizedLookupText } from '@/lib/admin/types';

/** عنصر تخصص معروض في قائمة التسجيل — القيمة المرسلة حقل specialization كنص */
export type DoctorSignupSpecialtyOption = {
  /** للعرض والتمييز في الواجهة */
  key: string;
  /** النص العربي للعرض */
  labelAr: string;
  /** القيمة المُرسَلة إلى POST /api/auth/signup (doctor) كـ specialization */
  value: string;
};

export type DoctorSpecialtiesMetaResponse = {
  messageKey?: string;
  message?: string;
  specialties?: unknown[];
  lookups?: unknown[];
  options?: unknown[];
  items?: unknown[];
  results?: unknown[];
  data?: unknown[];
};
