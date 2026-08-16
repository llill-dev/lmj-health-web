import { ApiError } from '@/lib/api';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';

function complaintMessageKeyToArabic(messageKey: string | null): string | null {
  switch (messageKey) {
    case 'errors.complaint.notFound':
      return 'لم يتم العثور على الشكوى المطلوبة.';
    case 'errors.complaint.invalidStatusTransition':
      return 'لا يمكن تنفيذ انتقال الحالة المطلوب لهذه الشكوى.';
    case 'errors.complaint.forbidden':
      return 'ليست لديك صلاحية للوصول إلى هذه الشكوى أو تعديلها.';
    case 'errors.validation.invalidId':
      return 'معرّف الشكوى غير صالح.';
    default:
      return null;
  }
}

export function complaintUserFacingError(
  error: unknown,
  fallback = 'تعذّر إكمال العملية الخاصة بالشكوى.',
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.';
    }
    if (error.status === 403) {
      return 'ليست لديك صلاحية الوصول إلى هذه الشكوى أو تحديثها حالياً.';
    }
    if (error.status === 404) {
      return 'الشكوى المطلوبة غير موجودة أو لم تعد متاحة لهذا الإجراء.';
    }
    if (error.status === 422) {
      return 'تعذّر حفظ تحديث الشكوى. راجع الحالة أو رد الإدارة ثم أعد المحاولة.';
    }
    const mapped = complaintMessageKeyToArabic(error.messageKey);
    if (mapped) return mapped;
  }
  return userFacingErrorMessage(error, fallback);
}
