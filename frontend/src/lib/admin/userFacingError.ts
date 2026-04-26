import { ApiError } from '@/lib/base';

/** بادئات قديمة أو من مصادر أخرى لا نريد إظهارها للمشرف */
const RE_AR_STATUS = /^خطأ\s*\d+\s*:\s*/u;
const RE_EN_STATUS = /^Error\s+\d+:\s*/i;
const RE_AR_UPLOAD = /^خطأ رفع:\s*\d+/u;
const RE_EN_UPLOAD = /^Upload error:\s*\d+/i;

/**
 * يزيل بادئة رمز HTTP من نص رسالة (عربي/إنجليزي) لعرضها في واجهة الإدارة.
 */
export function stripHttpStatusFromMessage(s: string): string {
  let t = s.trim();
  if (!t) return t;
  t = t.replace(RE_AR_STATUS, '');
  t = t.replace(RE_EN_STATUS, '');
  t = t.replace(RE_AR_UPLOAD, 'تعذّر رفع الملف');
  t = t.replace(RE_EN_UPLOAD, 'Upload failed');
  return t.trim();
}

/**
 * رسالة خطأ آمنة للمشرف: بدون رموز HTTP في النص المعروض.
 */
export function userFacingErrorMessage(
  err: unknown,
  fallback = 'تعذّر إكمال العملية.',
): string {
  if (err == null) return fallback;
  if (typeof err === 'string') {
    const u = stripHttpStatusFromMessage(err);
    return u || fallback;
  }
  if (err instanceof ApiError) {
    const u = stripHttpStatusFromMessage(err.message);
    return u || fallback;
  }
  if (err instanceof Error) {
    const u = stripHttpStatusFromMessage(err.message);
    return u || fallback;
  }
  return fallback;
}
