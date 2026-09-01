import { ApiError } from '@/lib/api';

type Tr = (ar: string, en: string) => string;
const identityTr: Tr = (ar) => ar;

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
  'An unexpected error occurred.',
  'An unexpected error occurred',
  'errors.unknown',
  'internal server error',
  'server error',
]);

function messageKeyToast(tr: Tr): Record<string, BillingPaymentErrorToast> {
  return {
    'errors.billing.invoiceNotPayable': {
      title: tr('لا يمكن إضافة دفعة', 'Cannot add payment'),
      message: tr(
        'هذه الفاتورة مسدّدة بالكامل أو غير قابلة للدفع (مسودة). اختر فاتورة صادرة فيها مبلغ متبقٍ.',
        'This invoice is fully paid or not payable (draft). Choose an issued invoice with a remaining balance.',
      ),
    },
    'errors.billing.paymentExceedsRemaining': {
      title: tr('المبلغ أكبر من المتبقي', 'Amount exceeds remaining balance'),
      message: tr(
        'مبلغ الدفعة يتجاوز الرصيد المتبقي على الفاتورة. عدّل المبلغ ثم أعد المحاولة.',
        'The payment amount exceeds the remaining balance on the invoice. Adjust the amount and try again.',
      ),
    },
    'errors.billing.paymentMethodNotAllowed': {
      title: tr('طريقة دفع غير مسموحة', 'Payment method not allowed'),
      message: tr(
        'طريقة الدفع المختارة غير مفعّلة في إعدادات الفوترة. اختر طريقة أخرى.',
        'The selected payment method is not enabled in the billing settings. Choose another method.',
      ),
    },
    'errors.billing.invoiceNotFound': {
      title: tr('الفاتورة غير موجودة', 'Invoice not found'),
      message: tr(
        'لم يُعثَر على الفاتورة المحددة. ارجع إلى قائمة الفواتير واختر فاتورة صالحة.',
        'The specified invoice could not be found. Go back to the invoice list and choose a valid invoice.',
      ),
    },
    'errors.validation.futureDateNotAllowed': {
      title: tr('تاريخ غير صالح', 'Invalid date'),
      message: tr(
        'التاريخ المدخل لا يمكن أن يكون في المستقبل. اختر تاريخ اليوم أو تاريخاً سابقاً.',
        'The entered date cannot be in the future. Choose today or an earlier date.',
      ),
    },
    'errors.auth.notAuthenticated': {
      title: tr('انتهت الجلسة', 'Session expired'),
      message: tr(
        'انتهت صلاحية تسجيل الدخول. سجّل الدخول من جديد ثم أعد المحاولة.',
        'Your login has expired. Sign in again and try again.',
      ),
    },
    'errors.auth.sessionExpired': {
      title: tr('انتهت الجلسة', 'Session expired'),
      message: tr(
        'انتهت صلاحية الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.',
        'Your session has expired. Sign in again and try again.',
      ),
    },
    'errors.billing.invoiceNotEditable': {
      title: tr('لا يمكن تعديل الفاتورة', 'Cannot edit invoice'),
      message: tr(
        'يمكن تعديل المسودات فقط. الفواتير الصادرة أو المدفوعة لا تُعدَّل من هنا.',
        'Only drafts can be edited. Issued or paid invoices cannot be edited from here.',
      ),
    },
    'errors.billing.refundExceedsRefundable': {
      title: tr('مبلغ الاسترجاع كبير', 'Refund amount too large'),
      message: tr(
        'مبلغ الاسترجاع يتجاوز الرصيد القابل للاسترداد من هذه الدفعة.',
        'The refund amount exceeds the refundable balance for this payment.',
      ),
    },
    'errors.billing.paymentNotFound': {
      title: tr('الدفعة غير موجودة', 'Payment not found'),
      message: tr(
        'لم يُعثَر على الدفعة المحددة. أعد تحميل تفاصيل الفاتورة ثم حاول مجدداً.',
        'The specified payment could not be found. Reload the invoice details and try again.',
      ),
    },
  };
}

function looksLikeMessageKey(value: string): boolean {
  return /^errors\.[a-zA-Z0-9.]+$/.test(value.trim());
}

function findKnownMessageKey(error: ApiError, toasts: Record<string, BillingPaymentErrorToast>): string | null {
  if (error.messageKey && toasts[error.messageKey]) {
    return error.messageKey;
  }

  const message = readBillingValidationString(error.message) ?? '';
  if (looksLikeMessageKey(message) && toasts[message]) {
    return message;
  }

  const errors = error.body.errors;
  if (!Array.isArray(errors)) return null;

  for (const entry of errors) {
    const item = asBillingValidationErrorRecord(entry);
    if (!item) continue;
    const messageKey = readBillingValidationString(item.messageKey);
    if (messageKey && toasts[messageKey]) {
      return messageKey;
    }
    const nestedMsg = readBillingValidationString(item.msg) ?? '';
    if (nestedMsg && looksLikeMessageKey(nestedMsg) && toasts[nestedMsg]) {
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

function formatValidationErrors(
  body: BillingValidationErrorRecord,
  tr: Tr,
): string | null {
  const errors = body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const toasts = messageKeyToast(tr);
  const parts = errors.slice(0, 3).map((entry) => {
    const item = asBillingValidationErrorRecord(entry) ?? {};
    const itemMessageKey = readBillingValidationString(item.messageKey);
    const itemMsg = readBillingValidationString(item.msg);
    const key =
      itemMessageKey ??
      (itemMsg && looksLikeMessageKey(itemMsg) ? itemMsg : null);
    if (key && toasts[key]) {
      return toasts[key].message;
    }
    const msg = itemMsg ?? '';
    if (msg && !looksLikeMessageKey(msg)) {
      return msg;
    }
    return readBillingValidationString(item.path) ?? tr('قيمة غير صالحة', 'Invalid value');
  });

  return parts.join(' · ');
}

export function getBillingPaymentErrorToast(
  error: unknown,
  tr: Tr = identityTr,
): BillingPaymentErrorToast {
  if (!(error instanceof ApiError)) {
    return {
      title: tr('تعذّر حفظ الدفعة', 'Could not save the payment'),
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : tr(
              'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
              'Could not reach the server. Check your internet connection and try again.',
            ),
    };
  }

  const toasts = messageKeyToast(tr);
  const knownKey = findKnownMessageKey(error, toasts);
  if (knownKey) {
    return toasts[knownKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body, tr);
    return {
      title: tr('بيانات الدفعة غير مقبولة', 'The payment data is not accepted'),
      message:
        validationDetail ??
        tr(
          'تحقّق من المبلغ وطريقة الدفع والتاريخ. تأكد أن الفاتورة غير مسدّدة بالكامل.',
          'Check the amount, payment method, and date. Make sure the invoice is not fully paid.',
        ),
    };
  }

  if (error.status === 409) {
    const backendMessage = error.message.trim();
    if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
      return {
        title: tr('لا يمكن إضافة الدفعة', 'Cannot add the payment'),
        message: backendMessage,
      };
    }
    return toasts['errors.billing.invoiceNotPayable'];
  }

  if (
    error.status >= 500 ||
    error.messageKey === 'errors.unknown' ||
    isGenericBackendMessage(error.message, error.messageKey)
  ) {
    return {
      title: tr('تعذّر حفظ الدفعة', 'Could not save the payment'),
      message: tr(
        'الخادم لم يكمل تسجيل الدفعة (خطأ داخلي). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
        'The server could not complete recording the payment (internal error). Try again later or contact support if it persists.',
      ),
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return {
      title: tr('تعذّر حفظ الدفعة', 'Could not save the payment'),
      message: backendMessage,
    };
  }

  return {
    title: tr('تعذّر حفظ الدفعة', 'Could not save the payment'),
    message: tr(
      'تعذّر إتمام الطلب. راجع البيانات وحاول مجدداً.',
      'Could not complete the request. Review the data and try again.',
    ),
  };
}

export function getBillingInvoiceLoadErrorToast(
  error: unknown,
  tr: Tr = identityTr,
): BillingPaymentErrorToast {
  if (!(error instanceof ApiError)) {
    return {
      title: tr('تعذّر تحميل الفاتورة', 'Could not load the invoice'),
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : tr(
              'تعذّر الاتصال بالخادم. تحقّق من الإنترنت ثم أعد المحاولة.',
              'Could not reach the server. Check your internet connection and try again.',
            ),
    };
  }

  if (error.status === 404) {
    return {
      title: tr('الفاتورة غير موجودة', 'Invoice not found'),
      message: tr(
        'لم يُعثَر على الفاتورة. افتح الصفحة من تفاصيل فاتورة أو من قائمة الفواتير.',
        'The invoice could not be found. Open the page from invoice details or the invoice list.',
      ),
    };
  }

  if (error.status === 422 || error.status === 400) {
    return {
      title: tr('معرّف فاتورة غير صالح', 'Invalid invoice identifier'),
      message: tr(
        'رقم الفاتورة في الرابط غير مقبول من الخادم. افتح «إضافة دفعة» من تفاصيل الفاتورة مباشرة.',
        'The invoice number in the link is not accepted by the server. Open "Add payment" directly from the invoice details.',
      ),
    };
  }

  if (error.status === 403) {
    return {
      title: tr('صلاحية غير كافية', 'Insufficient permission'),
      // Adding a payment only requires billing:payments:manage, but loading the
      // invoice itself requires the separate billing:invoices:view permission.
      message: tr(
        'يتطلب فتح تفاصيل الفاتورة صلاحية عرض الفواتير (billing:invoices:view)، وهي منفصلة عن صلاحية إدارة الدفعات.',
        'Opening invoice details requires the invoice view permission (billing:invoices:view), which is separate from the payment management permission.',
      ),
    };
  }

  return getBillingPaymentErrorToast(error, tr);
}

function resolveBillingErrorToast(
  error: unknown,
  fallback: BillingErrorToast,
  tr: Tr,
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

  const toasts = messageKeyToast(tr);
  const knownKey = findKnownMessageKey(error, toasts);
  if (knownKey) {
    return toasts[knownKey];
  }

  if (
    error.messageKey === 'errors.validationFailed' ||
    error.status === 422 ||
    error.status === 400
  ) {
    const validationDetail = formatValidationErrors(error.body, tr);
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
      message: tr(
        'الخادم لم يكمل الطلب (خطأ داخلي). أعد المحاولة لاحقاً أو أبلغ الدعم إذا استمرّ.',
        'The server could not complete the request (internal error). Try again later or contact support if it persists.',
      ),
    };
  }

  const backendMessage = error.message.trim();
  if (backendMessage && !isGenericBackendMessage(backendMessage, error.messageKey)) {
    return { title: fallback.title, message: backendMessage };
  }

  return fallback;
}

export function getBillingInvoiceUpdateErrorToast(
  error: unknown,
  tr: Tr = identityTr,
): BillingErrorToast {
  return resolveBillingErrorToast(
    error,
    {
      title: tr('تعذّر حفظ التعديلات', 'Could not save the changes'),
      message: tr(
        'تحقّق من البنود والخصم وتاريخ الاستحقاق. يمكن تعديل المسودات فقط.',
        'Check the line items, discount, and due date. Only drafts can be edited.',
      ),
    },
    tr,
  );
}

export function getBillingRefundErrorToast(
  error: unknown,
  tr: Tr = identityTr,
): BillingErrorToast {
  return resolveBillingErrorToast(
    error,
    {
      title: tr('تعذّر تسجيل الاسترجاع', 'Could not record the refund'),
      message: tr(
        'تحقّق من الدفعة والمبلغ والسبب. يجب ألا يتجاوز الاسترجاع الرصيد القابل للاسترداد.',
        'Check the payment, amount, and reason. The refund must not exceed the refundable balance.',
      ),
    },
    tr,
  );
}
