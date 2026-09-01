import { ApiError } from '@/lib/api';
import { getCurrentLocale } from '@/i18n/runtime';

type SupportedLocale = 'ar' | 'en';

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === 'en' ? en : ar;
}

const PASSWORD_MESSAGE_KEYS = new Set([
  'errors.auth.currentPasswordIncorrect',
  'errors.auth.invalidCredentials',
  'errors.auth.invalidPassword',
  'errors.validation.currentPassword',
]);

const OTP_MESSAGE_KEYS = new Set([
  'errors.auth.invalidOtp',
  'errors.auth.otpInvalid',
  'errors.auth.otpExpired',
  'errors.otp.invalid',
  'errors.otp.expired',
]);

export function isAccountDeletionPasswordError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const key = error.messageKey ?? '';
  if (PASSWORD_MESSAGE_KEYS.has(key)) return true;
  if (error.status === 401) return true;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('password') ||
    msg.includes('كلمة المرور') ||
    msg.includes('current password')
  );
}

export function isAccountDeletionOtpError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const key = error.messageKey ?? '';
  if (OTP_MESSAGE_KEYS.has(key)) return true;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('otp') ||
    msg.includes('verification code') ||
    msg.includes('رمز') ||
    msg.includes('تحقق')
  );
}

export function mapAccountDeletionPasswordError(
  error: unknown,
  locale: SupportedLocale = getCurrentLocale(),
): string {
  if (error instanceof ApiError) {
    if (isAccountDeletionPasswordError(error)) {
      return tr(
        locale,
        'كلمة المرور غير صحيحة. حاول مرة أخرى.',
        'Incorrect password. Try again.',
      );
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return tr(
    locale,
    'تعذّر التحقق من كلمة المرور.',
    'Could not verify the password.',
  );
}

export function mapAccountDeletionOtpError(
  error: unknown,
  locale: SupportedLocale = getCurrentLocale(),
): string {
  if (error instanceof ApiError) {
    if (error.messageKey === 'errors.auth.otpExpired') {
      return tr(
        locale,
        'انتهت صلاحية رمز التحقق. أعد إرسال رمز جديد.',
        'The verification code has expired. Resend a new code.',
      );
    }
    if (isAccountDeletionOtpError(error)) {
      return tr(
        locale,
        'رمز التحقق غير صحيح. تحقق من الرمز وأعد المحاولة.',
        'The verification code is incorrect. Check the code and try again.',
      );
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return tr(
    locale,
    'تعذّر التحقق من رمز التحقق.',
    'Could not verify the code.',
  );
}

export function mapAccountDeletionGenericError(
  error: unknown,
  fallback: string,
  locale: SupportedLocale = getCurrentLocale(),
): string {
  if (error instanceof ApiError) {
    if (error.messageKey === 'errors.routeNotFound' || error.status === 404) {
      return tr(
        locale,
        'تعذّر إتمام الاسترجاع. مسار إلغاء الحذف غير متاح على الخادم حالياً.',
        'Could not complete the recovery. The cancel-deletion route is not available on the server right now.',
      );
    }
    if (error.status === 401) {
      return tr(
        locale,
        'تعذّر إتمام الاسترجاع. لا توجد جلسة مصادقة نشطة — أعد تسجيل الدخول إن أمكن ثم حاول مرة أخرى.',
        'Could not complete the recovery. There is no active session — sign in again if possible and try again.',
      );
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
