import type { AdminLookupCategory } from '@/lib/admin/types';

const ALLOWED: readonly AdminLookupCategory[] = [
  'BLOOD_TYPE',
  'ALLERGY',
  'MEDICAL_CONDITION',
  'SPECIALIZATION',
  'DOCTOR_SPECIALIZATION',
];

/**
 * صفحة «تخصصات الأطباء» تستدعي `GET /api/admin/lookups?category=…`.
 * مسار التسجيل العام يستدعي `GET /api/meta/doctor-specializations` ويعيد lookups من فئة **`DOCTOR_SPECIALIZATION`** نشطة فقط (حسب المرجع).
 *
 * بدون هذا التطابق: قد ترى التخصصات في لوحة الإدارة (فئة مختلفة، مثل `MEDICAL_CONDITION`) بينما يبقى كتالوج التسجيل فارغاً.
 *
 * لتجاوز الافتراضي: في `.env` عيّن `VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY` لإحدى القيم المعروضة ضمن ALLOWED إن كان الخادم يستخدم اسماً آخر بالفعل.
 */
export function resolveDoctorSpecialtyLookupCategory(): AdminLookupCategory {
  const raw = import.meta.env.VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY?.trim();
  if (raw && (ALLOWED as readonly string[]).includes(raw)) {
    return raw as AdminLookupCategory;
  }
  return 'DOCTOR_SPECIALIZATION';
}
