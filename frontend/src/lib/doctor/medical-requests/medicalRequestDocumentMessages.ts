import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale, type AppLocale } from '@/i18n/runtime';

function tr(locale: AppLocale, key: string): string {
  return getTranslationValue(locale, key) ?? key;
}

export const MEDICAL_REQUEST_NO_RESULT_FILES_AR = tr(
  'ar',
  'doctor.medicalRequests.errors.noResultFiles',
);

export const MEDICAL_REQUEST_NO_RESULT_VIEW_AR = tr(
  'ar',
  'doctor.medicalRequests.errors.noResultView',
);

export const MEDICAL_REQUEST_NO_RESULT_DATA_AR = tr(
  'ar',
  'doctor.medicalRequests.errors.noResultData',
);

export function medicalRequestNoResultFilesMessage(
  locale: AppLocale = getCurrentLocale(),
): string {
  return tr(locale, 'doctor.medicalRequests.errors.noResultFiles');
}

export function medicalRequestNoResultViewMessage(
  locale: AppLocale = getCurrentLocale(),
): string {
  return tr(locale, 'doctor.medicalRequests.errors.noResultView');
}

/** رسائل واضحة عند فشل POST /api/documents/generate أو غياب المرفقات. */
export function resolveMedicalRequestDocumentErrorMessage(
  error: unknown,
  locale: AppLocale = getCurrentLocale(),
): string {
  const noResultData = tr(locale, 'doctor.medicalRequests.errors.noResultData');

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
      return noResultData;
    }

    if (
      status === 422 ||
      key.includes('validation') ||
      key.includes('invalidenum')
    ) {
      return tr(locale, 'doctor.medicalRequests.errors.cannotGenerate');
    }

    if (
      status === 403 ||
      key.includes('forbidden') ||
      key.includes('access')
    ) {
      return tr(locale, 'doctor.medicalRequests.errors.noDownloadAccess');
    }

    if (status >= 500 || key.includes('render') || key.includes('generat')) {
      return tr(locale, 'doctor.medicalRequests.errors.generationFailed');
    }

    const msg = error.message?.trim();
    if (msg && msg.length > 0 && !/^Request failed\.?$/i.test(msg)) {
      return msg;
    }
  }

  const generic = getUserFacingRequestErrorMessage(error, locale);
  if (
    generic.includes('لم يُعثَر') ||
    generic.includes('غير مقبولة') ||
    generic.includes('تعذّر إنشاء') ||
    generic.includes('not found') ||
    generic.includes('could not')
  ) {
    return noResultData;
  }

  return generic;
}
