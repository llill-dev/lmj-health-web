import { ApiError } from '@/lib/api';

export type BillingPaymentErrorToast = {
  title: string;
  message: string;
};

export type BillingErrorToast = BillingPaymentErrorToast;

type BillingValidationErrorRecord = {
  errors?: unknown;
  path?: unknown;
  msg?: unknown;
  messageKey?: unknown;
  [key: string]: unknown;
};

function asBillingValidationErrorRecord(
  value: unknown,
): BillingValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as BillingValidationErrorRecord)
    : null;
}

function readBillingValidationString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

const GENERIC_BACKEND_MESSAGES = new Set([
  'حدث خطأ غير متوقع.',
  'حدث خطأ غير متوقع',
  'errors.unknown',
  'internal server error',
  'server error',
]);

const MESSAGE_KEY_TOAST: Record<string, BillingPaymentErrorToast> = {
  'errors.billing.invoiceNotPayable': {
    title: 'لا يمكن إضافة دفعة',
    message:
      'هذه الفاتورة مسدّدة بالكامل أو غير قابلة للدفع (مسودة). اختر فاتورة صادرة فيها مبلغ متبقٍ.',
  },
  'errors.billing.paymentExceedsRemaining': {
    title: 'المبلغ أكبر من المتبقي',
    message: 'مبلغ الدفعة يتجاوز الرصيد المتبقي على الفاتورة. عدّل المبلغ ثم أعد المحاولة.',
  },
  'errors.billing.paymentMethodNotAllowed': {
    title: 'طريقة دفع غير مسموحة',
    message: 'طريقة الدفع المختارة غير مفعّلة في إعدادات الفوترة. اختر طريقة أخرى.',
  },
  'errors.billing.invoiceNotFound': {
    title: 'الفاتورة غير موجودة',
    message: 'لم يُعثَر على الفاتورة المحددة. ارجع إلى قائمة الفواتير واختر فاتورة صالحة.',
  },
  'errors.validation.futureDateNotAllowed': {
    title: 'تاريخ غير صالح',
    message:
      'التاريخ المدخل لا يمكن أن يكون في المستقبل. اختر تاريخ اليوم أو تاريخاً سابقاً.',
  },
  'errors.auth.notAuthenticated': {
    title: 'انتهت الجلسة',
    message: 'انتهت صلاحية تسجيل الدخول. سجّل الدخول من جديد ثم أعد المحاولة.',
  },
  'errors.auth.sessionExpired': {
    title: 'انتهت الجلسة',
    message: 'انتهت صلاحية الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.',
  },
  'errors.billing.invoiceNotEditable': {
    title: 'لا يمكن تعديل الفاتورة',
    message: 'يمكن تعديل المسودات فقط. الفواتير الصادرة أو المدفوعة لا تُعدَّل من هنا.',
  },
  'errors.billing.refundExceedsRefundable': {
    title: 'مبلغ الاسترجاع كبير',
    message: 'مبلغ الاسترجاع يتجاوز الرصيد القابل للاسترداد من هذه الدفعة.',
  },
  'errors.billing.paymentNotFound': {
    title: 'الدفعة غير موجودة',
    message: 'لم يُعثَر على الدفعة المحددة. أعد تحميل تفاصيل الفاتورة ثم حاول مجدداً.',
  },
};

function looksLikeMessageKey(value: string): boolean {
  return /^errors\.[a-zA-Z0-9.]+$/.test(value.trim());
}

function findKnownMessageKey(error: ApiError): string | null {
  if (error.messageKey && MESSAGE_KEY_TOAST[error.messageKey]) {
    return error.messageKey;
  }

  const message = readBillingValidationString(error.message) ?? '';
  if (looksLikeMessageKey(message) && MESSAGE_KEY_TOAST[message]) {
    return message;
  }

  const errors = error.body.errors;
  if (!Array.isArray(errors)) return null;

  for (const entry of errors) {
    const item = asBillingValidationErrorRecord(entry);
    if (!item) continue;
    const messageKey = readBillingValidationString(item.messageKey);
    if (messageKey && MESSAGE_KEY_TOAST[messageKey]) {
      return messageKey;
    }
    const nestedMsg = readBillingValidationString(item.msg) ?? '';
    if (nestedMsg && looksLikeMessageKey(nestedMsg) && MESSAGE_KEY_TOAST[nestedMsg]) {
      return nestedMsg;
    }
  }

  return null;
}

function isGenericBackendMessage(message: string, messageKey: string | null): boolean {
  const normalized = message.trim().toLowerCase();
  if (messageKey && GENERIC_BACKEND_MESSAGES.has(messageKey)) return true;
  if (GENERIC_BACKEND_MESSAGES.has(message.trim())) return true;
  if (looksLikeMessageKey(message)) return true;
  return normalized === 'internal server error' || normalized === 'server error';
}

function formatValidationErrors(body: BillingValidationErrorRecord): string | null {
  const errors = body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const parts = errors.slice(0, 3).map((entry) => {
    const item = asBillingValidationErrorRecord(entry) ?? {};
    const itemMessageKey = readBillingValidationString(item.messageKey);
    const itemMsg = readBillingValidationString(item.msg);
    const key =
      itemMessageKey ??
      (itemMsg && looksLikeMessageKey(itemMsg) ? itemMsg : null);
    if (key && MESSAGE_KEY_TOAST[key]) {
      return MESSAGE_KEY_TOAST[key].message;
    }
    const msg = itemMsg ?? '';
    if (msg && !looksLikeMessageKey(msg)) {
      return msg;
    }
    return readBillingValidationString(item.path) ?? 'قيمة غير صالحة';
  });

  return parts.join(' · ');
}

export function getBillingPaymentErrorToast(error: unknown): BillingPaymentErrorToast {
  if (!(error instanceof ApiError)) {
    return {
      title: 'تعذّر حفظ الدفعة',
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
    };
  }

  const knownKey = findKnownMessageKey(error);
  if (knownKey) {
    return MESSAGE_KEY_TOAST[knownKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body);
    return {
      title: 'بيانات الدفعة غير مقبولة',
      message:
        validationDetail ??
        'تحقّق من المبلغ وطريقة الدفع والتاريخ. تأكد أن الفاتورة غير مسدّدة بالكامل.',
    };
  }

  if (error.status === 409) {
    const backendMessage = error.message.trim();
    if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
      return {
        title: 'لا يمكن إضافة الدفعة',
        message: backendMessage,
      };
    }
    return MESSAGE_KEY_TOAST['errors.billing.invoiceNotPayable'];
  }

  if (
    error.status >= 500 ||
    error.messageKey === 'errors.unknown' ||
    isGenericBackendMessage(error.message, error.messageKey)
  ) {
    return {
      title: 'تعذّر حفظ الدفعة',
      message:
        'الخادم لم يكمل تسجيل الدفعة (خطأ داخلي). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return {
      title: 'تعذّر حفظ الدفعة',
      message: backendMessage,
    };
  }

  return {
    title: 'تعذّر حفظ الدفعة',
    message: 'تعذّر إتمام الطلب. راجع البيانات وحاول مجدداً.',
  };
}

export function getBillingInvoiceLoadErrorToast(error: unknown): BillingPaymentErrorToast {
  if (!(error instanceof ApiError)) {
    return {
      title: 'تعذّر تحميل الفاتورة',
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
    };
  }

  if (error.status === 404) {
    return {
      title: 'الفاتورة غير موجودة',
      message: 'لم يُعثَر على الفاتورة. افتح الصفحة من تفاصيل فاتورة أو من قائمة الفواتير.',
    };
  }

  if (error.status === 422 || error.status === 400) {
    return {
      title: 'معرّف فاتورة غير صالح',
      message:
        'رقم الفاتورة في الرابط غير مقبول من الخادم. افتح «إضافة دفعة» من تفاصيل الفاتورة مباشرة.',
    };
  }

  return getBillingPaymentErrorToast(error);
}

function resolveBillingErrorToast(
  error: unknown,
  fallback: BillingErrorToast,
): BillingErrorToast {
  if (!(error instanceof ApiError)) {
    return {
      title: fallback.title,
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : fallback.message,
    };
  }

  const knownKey = findKnownMessageKey(error);
  if (knownKey) {
    return MESSAGE_KEY_TOAST[knownKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body);
    return {
      title: fallback.title,
      message: validationDetail ?? fallback.message,
    };
  }

  if (error.status === 409) {
    const backendMessage = error.message.trim();
    if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
      return { title: fallback.title, message: backendMessage };
    }
  }

  if (
    error.status >= 500 ||
    error.messageKey === 'errors.unknown' ||
    isGenericBackendMessage(error.message, error.messageKey)
  ) {
    return {
      title: fallback.title,
      message:
        'الخادم لم يكمل الطلب (خطأ داخلي). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return { title: fallback.title, message: backendMessage };
  }

  return fallback;
}

export function getBillingInvoiceUpdateErrorToast(error: unknown): BillingErrorToast {
  return resolveBillingErrorToast(error, {
    title: 'تعذّر حفظ التعديلات',
    message: 'تحقّق من البنود والخصم وتاريخ الاستحقاق. يمكن تعديل المسودات فقط.',
  });
}

export function getBillingRefundErrorToast(error: unknown): BillingErrorToast {
  return resolveBillingErrorToast(error, {
    title: 'تعذّر تسجيل الاسترجاع',
    message:
      'تحقّق من الدفعة والمبلغ والسبب. يجب ألا يتجاوز الاسترجاع الرصيد القابل للاسترداد.',
  });
}
