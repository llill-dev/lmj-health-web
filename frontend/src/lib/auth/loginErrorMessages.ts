import type { AuthError } from '@/lib/auth/types';

export type LoginMethod = 'phone' | 'email';

const LOGIN_ERROR_MESSAGES_BY_METHOD: Record<
  LoginMethod,
  Partial<Record<AuthError['code'], string>>
> = {
  phone: {
    INVALID_CREDENTIALS: 'رقم الهاتف أو كلمة المرور غير صحيحة',
    NOT_VERIFIED:
      'الحساب المرتبط بهذا الرقم غير موثّق بعد. أكمل التحقق برمز OTP على هاتفك. إذا كان لديك أكثر من حساب بنفس الرقم، سجّل الدخول بالبريد الإلكتروني.',
    INACTIVE: 'الحساب غير نشط، تواصل مع الدعم',
    PENDING_APPROVAL: 'حساب الطبيب في انتظار موافقة الإدارة',
    NOT_ALLOWED: 'هذا الحساب غير مسموح له باستخدام هذا التطبيق',
    TEMPORARY: 'حسابك غير مفعّل بعد. سيتم توجيهك لصفحة التفعيل.',
    LOCKED:
      'الحساب مقفول. إذا طلبت حذف الحساب مؤخراً فقد لا يزال بإمكانك تسجيل الدخول خلال فترة الاسترجاع (7 أيام) حسب نوع الحساب.',
    DELETED:
      'تم إيقاف الحساب المرتبط بهذا الرقم. إذا كان لديك حساب آخر نشط بنفس الرقم، سجّل الدخول بالبريد الإلكتروني.',
    DELETION_RECOVERY:
      'حسابك في فترة استرجاع (7 أيام). سيتم توجيهك لصفحة استعادة الحساب.',
    NETWORK_ERROR:
      'تعذّر الوصول إلى الخادم. تحقّق من الإنترنت ثم أعد المحاولة؛ إن استمر الأمر قد يكون سببه الخدمة وليس شبكتك.',
    UNKNOWN: 'حدث خطأ غير متوقع، حاول مجدداً',
  },
  email: {
    INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    NOT_VERIFIED: 'الحساب غير موثّق، يرجى التحقق من بريدك الإلكتروني',
    INACTIVE: 'الحساب غير نشط، تواصل مع الدعم',
    PENDING_APPROVAL: 'حساب الطبيب في انتظار موافقة الإدارة',
    NOT_ALLOWED: 'هذا الحساب غير مسموح له باستخدام هذا التطبيق',
    TEMPORARY: 'حسابك غير مفعّل بعد. سيتم توجيهك لصفحة التفعيل.',
    LOCKED:
      'الحساب مقفول. إذا طلبت حذف الحساب مؤخراً فقد لا يزال بإمكانك تسجيل الدخول خلال فترة الاسترجاع (7 أيام) حسب نوع الحساب.',
    DELETED: 'تم حذف هذا الحساب أو انتهت فترة الاسترجاع. لا يمكن تسجيل الدخول.',
    DELETION_RECOVERY:
      'حسابك في فترة استرجاع (7 أيام). سيتم توجيهك لصفحة استعادة الحساب.',
    NETWORK_ERROR:
      'تعذّر الوصول إلى الخادم. تحقّق من الإنترنت ثم أعد المحاولة؛ إن استمر الأمر قد يكون سببه الخدمة وليس شبكتك.',
    UNKNOWN: 'حدث خطأ غير متوقع، حاول مجدداً',
  },
};

export function resolveLoginErrorMessageAr(
  code: AuthError['code'] | string,
  method: LoginMethod,
): string {
  const byMethod = LOGIN_ERROR_MESSAGES_BY_METHOD[method];
  return (
    byMethod[code as AuthError['code']] ??
    LOGIN_ERROR_MESSAGES_BY_METHOD.email.UNKNOWN!
  );
}
