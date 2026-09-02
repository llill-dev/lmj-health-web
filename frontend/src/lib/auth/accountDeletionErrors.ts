import { ApiError } from '@/lib/api';
import { getCurrentLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

type SupportedLocale = 'ar' | 'en';

function tr(locale: SupportedLocale, key: string, fallback: string): string {
  return getTranslationValue(locale, key) ?? fallback;
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
        'accountDeletion.error.incorrectPassword',
        'كلمة المرور غير صحيحة. حاول مرة أخرى.',
      );
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return tr(
    locale,
    'accountDeletion.error.passwordVerifyFailed',
    'تعذّر التحقق من كلمة المرور.',
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
        'accountDeletion.error.otpExpired',
        'انتهت صلاحية رمز التحقق. أعد إرسال رمز جديد.',
      );
    }
    if (isAccountDeletionOtpError(error)) {
      return tr(
        locale,
        'accountDeletion.error.otpIncorrect',
        'رمز التحقق غير صحيح. تحقق من الرمز وأعد المحاولة.',
      );
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return tr(
    locale,
    'accountDeletion.error.otpVerifyFailed',
    'تعذّر التحقق من رمز التحقق.',
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
        'accountDeletion.error.recoveryRouteUnavailable',
        'تعذّر إتمام الاسترجاع. مسار إلغاء الحذف غير متاح على الخادم حالياً.',
      );
    }
    if (error.status === 401) {
      return tr(
        locale,
        'accountDeletion.error.recoveryNoSession',
        'تعذّر إتمام الاسترجاع. لا توجد جلسة مصادقة نشطة — أعد تسجيل الدخول إن أمكن ثم حاول مرة أخرى.',
      );
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
