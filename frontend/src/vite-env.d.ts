/// <reference types="vite/client" />

type ViteBooleanString = 'true' | 'false' | undefined;

declare interface ImportMetaEnv {
  readonly VITE_UI_ONLY: ViteBooleanString;
  readonly VITE_API_ORIGIN?: string;
  /** BLOOD_TYPE | ALLERGY | MEDICAL_CONDITION | SPECIALIZATION | DOCTOR_SPECIALIZATION */
  readonly VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY?: string;
  /** يتجاوز مسار GET لخيارات تخصص الطبيب في التسجيل العام (افتراضي: من metaEndpoints.doctorSpecialties) */
  readonly VITE_PUBLIC_DOCTOR_SPECIALTIES_PATH?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
