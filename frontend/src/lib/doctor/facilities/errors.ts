import { ApiError } from '@/lib/api';

type SupportedLocale = 'ar' | 'en';

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === 'en' ? en : ar;
}

export type DoctorFacilitySaveToast = {
  title: string;
  message: string;
};

type DoctorFacilityValidationErrorRecord = {
  errors?: unknown;
  path?: unknown;
  msg?: unknown;
  [key: string]: unknown;
};

function asDoctorFacilityValidationErrorRecord(
  value: unknown,
): DoctorFacilityValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorFacilityValidationErrorRecord)
    : null;
}

function readDoctorFacilityValidationString(
  record: DoctorFacilityValidationErrorRecord,
  key: 'path' | 'msg',
): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

const FIELD_LABELS_AR: Record<string, string> = {
  name: 'اسم المنشأة',
  city: 'المدينة',
  facilityType: 'نوع المنشأة',
  kind: 'نوع المنشأة',
  phone: 'الهاتف',
  address: 'العنوان',
  country: 'الدولة',
  description: 'الوصف',
  attributes: 'الخصائص',
};

const FIELD_LABELS_EN: Record<string, string> = {
  name: 'Facility name',
  city: 'City',
  facilityType: 'Facility type',
  kind: 'Facility type',
  phone: 'Phone',
  address: 'Address',
  country: 'Country',
  description: 'Description',
  attributes: 'Attributes',
};

function fieldLabels(locale: SupportedLocale): Record<string, string> {
  return locale === 'en' ? FIELD_LABELS_EN : FIELD_LABELS_AR;
}

const GENERIC_BACKEND_MESSAGES = new Set([
  'حدث خطأ غير متوقع.',
  'حدث خطأ غير متوقع',
  'An unexpected error occurred.',
  'An unexpected error occurred',
  'errors.unknown',
  'internal server error',
  'server error',
]);

const MESSAGE_KEY_TOAST_AR: Record<string, DoctorFacilitySaveToast> = {
  'errors.facilities.ownerFacilityExists': {
    title: 'منشأة موجودة',
    message:
      'لديك منشأة مسجّلة بالفعل لحسابك. يمكنك امتلاك منشأة واحدة فقط — عدّل المنشأة الحالية.',
  },
  'facilities.request.duplicate_found': {
    title: 'منشأة مكرّرة',
    message:
      'توجد منشأة مشابهة (الاسم/المدينة) مسجّلة مسبقاً. غيّر الاسم أو المدينة، أو عدّل منشأتك الحالية.',
  },
  'errors.facilities.invalidAttributeKey': {
    title: 'خصائص غير مدعومة',
    message:
      'أحد مفاتيح خصائص المنشأة غير معتمد من الخادم. أزل أي خصائص غير قياسية ثم أعد المحاولة.',
  },
  'errors.facilities.notFound': {
    title: 'المنشأة غير موجودة',
    message: 'لم يُعثَر على منشأة مرتبطة بحسابك. أعد تحميل الصفحة ثم حاول مجدداً.',
  },
  'errors.facilities.invalidSelection': {
    title: 'اختيار غير صالح',
    message: 'المنشأة المختارة غير صالحة للربط أو التعديل.',
  },
  'errors.validation.invalidId': {
    title: 'معرّف غير صالح',
    message: 'المعرّف المُرسل غير صالح. أعد تحميل الصفحة ثم حاول مجدداً.',
  },
  'errors.validation.invalidEnum': {
    title: 'قيمة غير مدعومة',
    message:
      'أحد الحقول يحمل قيمة غير مدعومة (مثل نوع المنشأة). راجع الاختيارات ثم أعد المحاولة.',
  },
  'errors.forbidden': {
    title: 'صلاحية غير كافية',
    message: 'لا تملك صلاحية تنفيذ هذه العملية.',
  },
  'errors.facilities.ownerOnly': {
    title: 'صلاحية غير كافية',
    message: 'يمكنك إدارة منشأتك التي تملكها فقط.',
  },
  'errors.facilities.mergeTargetInvalid': {
    title: 'عملية غير مسموحة',
    message: 'هدف الدمج أو الربط غير صالح.',
  },
  'errors.facilities.actionNotAllowed': {
    title: 'عملية غير مسموحة',
    message: 'لا يمكن تنفيذ هذه العملية على المنشأة في حالتها الحالية.',
  },
  'errors.auth.notAuthenticated': {
    title: 'انتهت الجلسة',
    message: 'انتهت صلاحية تسجيل الدخول. سجّل الدخول من جديد ثم أعد المحاولة.',
  },
  'errors.auth.sessionExpired': {
    title: 'انتهت الجلسة',
    message: 'انتهت صلاحية الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.',
  },
};

const MESSAGE_KEY_TOAST_EN: Record<string, DoctorFacilitySaveToast> = {
  'errors.facilities.ownerFacilityExists': {
    title: 'Facility already exists',
    message:
      'You already have a facility registered for your account. You can only own one facility — edit the existing one.',
  },
  'facilities.request.duplicate_found': {
    title: 'Duplicate facility',
    message:
      'A similar facility (same name/city) is already registered. Change the name or city, or edit your existing facility.',
  },
  'errors.facilities.invalidAttributeKey': {
    title: 'Unsupported attributes',
    message:
      'One of the facility attribute keys is not supported by the server. Remove any non-standard attributes and try again.',
  },
  'errors.facilities.notFound': {
    title: 'Facility not found',
    message: 'No facility linked to your account was found. Reload the page and try again.',
  },
  'errors.facilities.invalidSelection': {
    title: 'Invalid selection',
    message: 'The selected facility is not valid for linking or editing.',
  },
  'errors.validation.invalidId': {
    title: 'Invalid identifier',
    message: 'The submitted identifier is invalid. Reload the page and try again.',
  },
  'errors.validation.invalidEnum': {
    title: 'Unsupported value',
    message:
      'One of the fields has an unsupported value (such as facility type). Review the choices and try again.',
  },
  'errors.forbidden': {
    title: 'Insufficient permission',
    message: 'You do not have permission to perform this action.',
  },
  'errors.facilities.ownerOnly': {
    title: 'Insufficient permission',
    message: 'You can only manage the facility you own.',
  },
  'errors.facilities.mergeTargetInvalid': {
    title: 'Action not allowed',
    message: 'The merge or link target is invalid.',
  },
  'errors.facilities.actionNotAllowed': {
    title: 'Action not allowed',
    message: 'This action cannot be performed on the facility in its current state.',
  },
  'errors.auth.notAuthenticated': {
    title: 'Session expired',
    message: 'Your login has expired. Sign in again and try again.',
  },
  'errors.auth.sessionExpired': {
    title: 'Session expired',
    message: 'Your session has expired. Sign in again and try again.',
  },
};

function messageKeyToast(locale: SupportedLocale): Record<string, DoctorFacilitySaveToast> {
  return locale === 'en' ? MESSAGE_KEY_TOAST_EN : MESSAGE_KEY_TOAST_AR;
}

function formatValidationErrors(
  body: DoctorFacilityValidationErrorRecord,
  locale: SupportedLocale,
): string | null {
  const errors = body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const labels = fieldLabels(locale);
  const parts = errors.slice(0, 4).map((entry) => {
    const item = asDoctorFacilityValidationErrorRecord(entry) ?? {};
    const path = readDoctorFacilityValidationString(item, 'path');
    const field = labels[path] ?? path ?? tr(locale, 'حقل', 'field');
    const detail =
      readDoctorFacilityValidationString(item, 'msg') ||
      tr(locale, 'قيمة غير صالحة', 'Invalid value');
    return `${field}: ${detail}`;
  });

  return parts.join(' · ');
}

function isGenericBackendMessage(message: string, messageKey: string | null): boolean {
  const normalized = message.trim().toLowerCase();
  if (messageKey && GENERIC_BACKEND_MESSAGES.has(messageKey)) return true;
  if (GENERIC_BACKEND_MESSAGES.has(message.trim())) return true;
  if (normalized === 'internal server error' || normalized === 'server error') {
    return true;
  }
  return false;
}

function serverFailureToast(
  mode: 'create' | 'edit',
  locale: SupportedLocale,
): DoctorFacilitySaveToast {
  if (mode === 'create') {
    return {
      title: tr(locale, 'تعذّر إنشاء المنشأة', 'Could not create the facility'),
      message: tr(
        locale,
        'الخادم لم يكمل إنشاء المنشأة (خطأ داخلي 500). البيانات المرسلة مطابقة للتوثيق — المشكلة على جانب الخادم. أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
        'The server could not complete creating the facility (internal 500 error). The submitted data matches the documentation — this is a server-side issue. Try again later or contact support if it persists.',
      ),
    };
  }
  return {
    title: tr(locale, 'تعذّر تحديث المنشأة', 'Could not update the facility'),
    message: tr(
      locale,
      'الخادم لم يكمل حفظ التعديلات (خطأ داخلي 500). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
      'The server could not save the changes (internal 500 error). Try again later or contact support if it persists.',
    ),
  };
}

export function getDoctorFacilitySaveErrorToast(
  error: unknown,
  mode: 'create' | 'edit' = 'create',
  locale: SupportedLocale = 'ar',
): DoctorFacilitySaveToast {
  if (error instanceof Error && error.message === 'facility_response_invalid') {
    return {
      title:
        mode === 'create'
          ? tr(locale, 'تعذّر إنشاء المنشأة', 'Could not create the facility')
          : tr(locale, 'تعذّر تحديث المنشأة', 'Could not update the facility'),
      message: tr(
        locale,
        'تم قبول الطلب لكن استجابة الخادم ناقصة (لم تُرجَع بيانات المنشأة). أعد تحميل الصفحة وتحقّق من وجود المنشأة.',
        'The request was accepted but the server response is incomplete (no facility data was returned). Reload the page and check whether the facility exists.',
      ),
    };
  }

  if (!(error instanceof ApiError)) {
    return {
      title: tr(locale, 'تعذّر حفظ المنشأة', 'Could not save the facility'),
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : tr(
              locale,
              'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
              'Could not reach the server. Check your internet connection and try again.',
            ),
    };
  }

  const messageKeyToasts = messageKeyToast(locale);

  if (error.messageKey && messageKeyToasts[error.messageKey]) {
    return messageKeyToasts[error.messageKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body, locale);
    return {
      title: tr(locale, 'بيانات المنشأة غير مقبولة', 'The facility data is not accepted'),
      message:
        validationDetail ??
        tr(
          locale,
          'تحقّق من الحقول المطلوبة: الاسم، المدينة، نوع المنشأة، الهاتف، والعنوان.',
          'Check the required fields: name, city, facility type, phone, and address.',
        ),
    };
  }

  if (error.status === 401 || error.status === 403) {
    return (
      messageKeyToasts[error.messageKey ?? ''] ?? {
        title:
          error.status === 401
            ? tr(locale, 'انتهت الجلسة', 'Session expired')
            : tr(locale, 'صلاحية غير كافية', 'Insufficient permission'),
        message:
          error.status === 401
            ? tr(
                locale,
                'انتهت صلاحية تسجيل الدخول. سجّل الدخول من جديد ثم أعد المحاولة.',
                'Your login has expired. Sign in again and try again.',
              )
            : tr(locale, 'لا تملك صلاحية حفظ المنشأة.', 'You do not have permission to save the facility.'),
      }
    );
  }

  if (
    error.status >= 500 ||
    error.messageKey === 'errors.unknown' ||
    isGenericBackendMessage(error.message, error.messageKey)
  ) {
    return serverFailureToast(mode, locale);
  }

  if (error.status === 409) {
    return {
      title: tr(locale, 'تعارض في البيانات', 'Data conflict'),
      message:
        error.message.trim() && !isGenericBackendMessage(error.message, error.messageKey)
          ? error.message
          : tr(
              locale,
              'تعارض مع منشأة موجودة (اسم/مدينة). راجع البيانات أو عدّل منشأتك الحالية.',
              'Conflicts with an existing facility (name/city). Review the data or edit your existing facility.',
            ),
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return {
      title:
        mode === 'create'
          ? tr(locale, 'تعذّر إنشاء المنشأة', 'Could not create the facility')
          : tr(locale, 'تعذّر تحديث المنشأة', 'Could not update the facility'),
      message: backendMessage,
    };
  }

  return {
    title: tr(locale, 'تعذّر حفظ المنشأة', 'Could not save the facility'),
    message: tr(
      locale,
      'تعذّر إتمام الطلب. راجع البيانات وحاول مجدداً.',
      'Could not complete the request. Review the data and try again.',
    ),
  };
}

export function getDoctorFacilityLinkErrorToast(
  error: unknown,
  locale: SupportedLocale = 'ar',
): DoctorFacilitySaveToast {
  if (error instanceof ApiError) {
    const messageKeyToasts = messageKeyToast(locale);
    if (error.messageKey === 'errors.facilities.invalidSelection') {
      return messageKeyToasts['errors.facilities.invalidSelection'];
    }
    if (error.messageKey === 'errors.facilities.ownerFacilityExists') {
      return messageKeyToasts['errors.facilities.ownerFacilityExists'];
    }
    if (error.messageKey === 'errors.facilities.notFound') {
      return {
        title: tr(locale, 'المنشأة غير موجودة', 'Facility not found'),
        message: tr(
          locale,
          'المنشأة المختارة غير متاحة للربط. جرّب البحث مجدداً.',
          'The selected facility is not available for linking. Try searching again.',
        ),
      };
    }
  }

  const fallback = getDoctorFacilitySaveErrorToast(error, 'create', locale);
  if (fallback.title === tr(locale, 'تعذّر إنشاء المنشأة', 'Could not create the facility')) {
    return {
      title: tr(locale, 'تعذّر ربط المنشأة', 'Could not link the facility'),
      message: fallback.message,
    };
  }
  return fallback;
}

export function getDoctorFacilitySuggestErrorToast(
  error: unknown,
  locale: SupportedLocale = 'ar',
): DoctorFacilitySaveToast {
  const fallback = getDoctorFacilitySaveErrorToast(error, 'create', locale);
  return {
    title: tr(locale, 'تعذّر إرسال الاقتراح', 'Could not send the suggestion'),
    message: fallback.message,
  };
}
