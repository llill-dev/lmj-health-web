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
    const mapped = complaintMessageKeyToArabic(error.messageKey);
    if (mapped) return mapped;
  }
  return userFacingErrorMessage(error, fallback);
}
