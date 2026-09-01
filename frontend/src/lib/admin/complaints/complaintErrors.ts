import { ApiError } from '@/lib/api';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { getCurrentLocale } from '@/i18n/runtime';

type SupportedLocale = 'ar' | 'en';

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === 'ar' ? ar : en;
}

function complaintMessageKeyToText(
  messageKey: string | null,
  locale: SupportedLocale,
): string | null {
  switch (messageKey) {
    case 'errors.complaint.notFound':
      return tr(
        locale,
        'لم يتم العثور على الشكوى المطلوبة.',
        'The requested complaint could not be found.',
      );
    case 'errors.complaint.invalidStatusTransition':
      return tr(
        locale,
        'لا يمكن تنفيذ انتقال الحالة المطلوب لهذه الشكوى.',
        'This status transition is not allowed for this complaint.',
      );
    case 'errors.complaint.forbidden':
      return tr(
        locale,
        'ليست لديك صلاحية للوصول إلى هذه الشكوى أو تعديلها.',
        'You do not have permission to access or edit this complaint.',
      );
    case 'errors.validation.invalidId':
      return tr(locale, 'معرّف الشكوى غير صالح.', 'The complaint identifier is invalid.');
    default:
      return null;
  }
}

export function complaintUserFacingError(
  error: unknown,
  fallback?: string,
  locale: SupportedLocale = getCurrentLocale(),
): string {
  const resolvedFallback =
    fallback ??
    tr(
      locale,
      'تعذّر إكمال العملية الخاصة بالشكوى.',
      'Could not complete the complaint operation.',
    );

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        'انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.',
        'Your session has expired. Sign in again and try again.',
      );
    }
    if (error.status === 403) {
      return tr(
        locale,
        'ليست لديك صلاحية الوصول إلى هذه الشكوى أو تحديثها حالياً.',
        'You do not have permission to access or update this complaint right now.',
      );
    }
    if (error.status === 404) {
      return tr(
        locale,
        'الشكوى المطلوبة غير موجودة أو لم تعد متاحة لهذا الإجراء.',
        'The requested complaint does not exist or is no longer available for this action.',
      );
    }
    if (error.status === 422) {
      return tr(
        locale,
        'تعذّر حفظ تحديث الشكوى. راجع الحالة أو رد الإدارة ثم أعد المحاولة.',
        'Could not save the complaint update. Review the status or admin reply and try again.',
      );
    }
    const mapped = complaintMessageKeyToText(error.messageKey, locale);
    if (mapped) return mapped;
  }
  return userFacingErrorMessage(error, resolvedFallback);
}
