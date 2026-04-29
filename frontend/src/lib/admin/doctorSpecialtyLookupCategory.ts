import type { AdminLookupCategory } from '@/lib/admin/types';

const ALLOWED: readonly AdminLookupCategory[] = [
  'BLOOD_TYPE',
  'ALLERGY',
  'MEDICAL_CONDITION',
  'SPECIALIZATION',
];

/**
 * API-3 (LMJ Health Backend API Reference): `GET /api/admin/lookups` يفرض قيمة
 * `category` من القائمة: BLOOD_TYPE | ALLERGY | MEDICAL_CONDITION فقط.
 * إرسال `SPECIALIZATION` (أو غيرها خارج القائمة) → غالباً **422** من الـ validator.
 *
 * - للعمل مع خادم يلتزم بـ API-3 حصراً: اضبط
 *   `VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY=MEDICAL_CONDITION` (أو إحدى الفئات الثلاث).
 * - بعد إضافة فئة تخصصات الأطباء في الخادم (مثل SPECIALIZATION): عيّن نفس القيمة هنا.
 */
export function resolveDoctorSpecialtyLookupCategory(): AdminLookupCategory {
  const raw = import.meta.env.VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY?.trim();
  if (raw && (ALLOWED as readonly string[]).includes(raw)) {
    return raw as AdminLookupCategory;
  }
  return 'MEDICAL_CONDITION';
}
