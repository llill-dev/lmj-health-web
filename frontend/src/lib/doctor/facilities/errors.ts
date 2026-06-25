import { ApiError } from '@/lib/api';

export type DoctorFacilitySaveToast = {
  title: string;
  message: string;
};

const FIELD_LABELS: Record<string, string> = {
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

const GENERIC_BACKEND_MESSAGES = new Set([
  'حدث خطأ غير متوقع.',
  'حدث خطأ غير متوقع',
  'errors.unknown',
  'internal server error',
  'server error',
]);

const MESSAGE_KEY_TOAST: Record<string, DoctorFacilitySaveToast> = {
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

function formatValidationErrors(body: Record<string, unknown>): string | null {
  const errors = body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const parts = errors.slice(0, 4).map((entry) => {
    const item = entry as { path?: string; msg?: string };
    const field = FIELD_LABELS[item.path ?? ''] ?? item.path ?? 'حقل';
    const detail = item.msg?.trim() || 'قيمة غير صالحة';
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

function serverFailureToast(mode: 'create' | 'edit'): DoctorFacilitySaveToast {
  if (mode === 'create') {
    return {
      title: 'تعذّر إنشاء المنشأة',
      message:
        'الخادم لم يكمل إنشاء المنشأة (خطأ داخلي 500). البيانات المرسلة مطابقة للتوثيق — المشكلة على جانب الخادم. أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
    };
  }
  return {
    title: 'تعذّر تحديث المنشأة',
    message:
      'الخادم لم يكمل حفظ التعديلات (خطأ داخلي 500). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
  };
}

export function getDoctorFacilitySaveErrorToast(
  error: unknown,
  mode: 'create' | 'edit' = 'create',
): DoctorFacilitySaveToast {
  if (error instanceof Error && error.message === 'facility_response_invalid') {
    return {
      title: mode === 'create' ? 'تعذّر إنشاء المنشأة' : 'تعذّر تحديث المنشأة',
      message:
        'تم قبول الطلب لكن استجابة الخادم ناقصة (لم تُرجَع بيانات المنشأة). أعد تحميل الصفحة وتحقّق من وجود المنشأة.',
    };
  }

  if (!(error instanceof ApiError)) {
    return {
      title: 'تعذّر حفظ المنشأة',
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
    };
  }

  if (error.messageKey && MESSAGE_KEY_TOAST[error.messageKey]) {
    return MESSAGE_KEY_TOAST[error.messageKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body);
    return {
      title: 'بيانات المنشأة غير مقبولة',
      message:
        validationDetail ??
        'تحقّق من الحقول المطلوبة: الاسم، المدينة، نوع المنشأة، الهاتف، والعنوان.',
    };
  }

  if (error.status === 401 || error.status === 403) {
    return (
      MESSAGE_KEY_TOAST[error.messageKey ?? ''] ?? {
        title: error.status === 401 ? 'انتهت الجلسة' : 'صلاحية غير كافية',
        message:
          error.status === 401
            ? 'انتهت صلاحية تسجيل الدخول. سجّل الدخول من جديد ثم أعد المحاولة.'
            : 'لا تملك صلاحية حفظ المنشأة.',
      }
    );
  }

  if (
    error.status >= 500 ||
    error.messageKey === 'errors.unknown' ||
    isGenericBackendMessage(error.message, error.messageKey)
  ) {
    return serverFailureToast(mode);
  }

  if (error.status === 409) {
    return {
      title: 'تعارض في البيانات',
      message:
        error.message.trim() && !isGenericBackendMessage(error.message, error.messageKey)
          ? error.message
          : 'تعارض مع منشأة موجودة (اسم/مدينة). راجع البيانات أو عدّل منشأتك الحالية.',
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return {
      title: mode === 'create' ? 'تعذّر إنشاء المنشأة' : 'تعذّر تحديث المنشأة',
      message: backendMessage,
    };
  }

  return {
    title: 'تعذّر حفظ المنشأة',
    message: 'تعذّر إتمام الطلب. راجع البيانات وحاول مجدداً.',
  };
}

export function getDoctorFacilityLinkErrorToast(
  error: unknown,
): DoctorFacilitySaveToast {
  if (error instanceof ApiError) {
    if (error.messageKey === 'errors.facilities.invalidSelection') {
      return MESSAGE_KEY_TOAST['errors.facilities.invalidSelection'];
    }
    if (error.messageKey === 'errors.facilities.ownerFacilityExists') {
      return MESSAGE_KEY_TOAST['errors.facilities.ownerFacilityExists'];
    }
    if (error.messageKey === 'errors.facilities.notFound') {
      return {
        title: 'المنشأة غير موجودة',
        message: 'المنشأة المختارة غير متاحة للربط. جرّب البحث مجدداً.',
      };
    }
  }

  const fallback = getDoctorFacilitySaveErrorToast(error, 'create');
  if (fallback.title === 'تعذّر إنشاء المنشأة') {
    return {
      title: 'تعذّر ربط المنشأة',
      message: fallback.message,
    };
  }
  return fallback;
}
