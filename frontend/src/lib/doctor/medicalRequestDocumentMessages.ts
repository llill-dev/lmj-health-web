import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';

export const MEDICAL_REQUEST_NO_RESULT_FILES_AR =
  'لا توجد ملفات نتيجة متاحة للتحميل حالياً.';

export const MEDICAL_REQUEST_NO_RESULT_VIEW_AR =
  'لا توجد نتيجة أو ملفات متاحة للعرض حالياً.';

export const MEDICAL_REQUEST_NO_RESULT_DATA_AR =
  'لا توجد بيانات نتيجة أو ملفات لهذا الطلب.';

/** رسائل واضحة عند فشل POST /api/documents/generate أو غياب المرفقات. */
export function resolveMedicalRequestDocumentErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    const key = (error.messageKey ?? '').toLowerCase();
    const status = error.status;

    if (
      status === 404 ||
      key.includes('notfound') ||
      key.includes('not_found') ||
      key.includes('medicationnotfound') ||
      key.includes('orders.notfound')
    ) {
      return MEDICAL_REQUEST_NO_RESULT_DATA_AR;
    }

    if (
      status === 422 ||
      key.includes('validation') ||
      key.includes('invalidenum')
    ) {
      return 'لا يمكن إنشاء مستند نتيجة لهذا الطلب. تحقّق من اكتمال بيانات الطلب.';
    }

    if (
      status === 403 ||
      key.includes('forbidden') ||
      key.includes('access')
    ) {
      return 'لا تملك صلاحية تحميل نتيجة هذا الطلب.';
    }

    if (status >= 500 || key.includes('render') || key.includes('generat')) {
      return 'تعذّر إنشاء ملف النتيجة. لا توجد بيانات كافية أو الخدمة غير متاحة مؤقتاً.';
    }

    const msg = error.message?.trim();
    if (msg && msg.length > 0 && !/^Request failed\.?$/i.test(msg)) {
      return msg;
    }
  }

  const generic = getUserFacingRequestErrorMessage(error);
  if (
    generic.includes('لم يُعثَر') ||
    generic.includes('غير مقبولة') ||
    generic.includes('تعذّر إنشاء')
  ) {
    return MEDICAL_REQUEST_NO_RESULT_DATA_AR;
  }

  return generic;
}
