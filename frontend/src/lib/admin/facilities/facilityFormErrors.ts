import { ApiError } from '@/lib/api';

export type AdminFacilityFormName =
  | 'name'
  | 'facilityType'
  | 'city'
  | 'country'
  | 'address'
  | 'phone'
  | 'description'
  | 'status'
  | 'ownerDoctorId'
  | 'attributes';

export type AdminFacilityFormFeedback = {
  fields: Partial<Record<AdminFacilityFormName, string>>;
  rootBanner?: string;
  toastTitle: string;
  toastMessage: string;
};

type BackendValidationIssue = {
  path?: string;
  msg?: string;
  messageKey?: string;
};

function asBackendValidationIssue(value: unknown): BackendValidationIssue | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function readValidationIssueArray(value: unknown): BackendValidationIssue[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((issue) => asBackendValidationIssue(issue))
    .filter((issue): issue is BackendValidationIssue => issue != null);
}

const FIELD_LABELS: Record<AdminFacilityFormName, string> = {
  name: 'اسم المنشأة',
  facilityType: 'نوع المنشأة',
  city: 'المدينة',
  country: 'الدولة',
  address: 'العنوان',
  phone: 'رقم الهاتف',
  description: 'الوصف',
  status: 'الحالة',
  ownerDoctorId: 'معرّف طبيب المالك',
  attributes: 'سمات المنشأة',
};

const PATH_TO_FIELD: Record<string, AdminFacilityFormName> = {
  name: 'name',
  city: 'city',
  facilityType: 'facilityType',
  kind: 'facilityType',
  country: 'country',
  address: 'address',
  phone: 'phone',
  description: 'description',
  status: 'status',
  ownerDoctorId: 'ownerDoctorId',
  attributes: 'attributes',
};

function toArabicMessageKeyFallback(messageKey: string | null, fallback: string): string {
  switch (messageKey) {
    case 'errors.validation.invalidId':
      return 'القيمة المدخلة تحتوي على معرّف غير صالح.';
    case 'errors.validation.invalidEnum':
      return 'الاختيار المحدد غير مدعوم في النظام.';
    case 'errors.facilities.invalidAttributeKey':
      return 'إحدى السمات غير صالحة بعد التطبيع.';
    case 'errors.facilities.ownerFacilityExists':
      return 'الطبيب المحدد يملك منشأة أخرى بالفعل.';
    case 'errors.facilities.notFound':
      return 'تعذر العثور على المنشأة المطلوبة.';
    case 'errors.forbidden':
    case 'errors.facilities.ownerOnly':
      return 'ليست لديك صلاحية لتنفيذ هذه العملية.';
    case 'errors.auth.notAuthenticated':
    case 'errors.auth.sessionExpired':
      return 'انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.';
    default:
      return fallback;
  }
}

function summarizeFieldErrors(fields: Partial<Record<AdminFacilityFormName, string>>): string | null {
  const entries = Object.entries(fields).filter(
    (entry): entry is [AdminFacilityFormName, string] =>
      typeof entry[1] === 'string' && entry[1].trim().length > 0,
  );
  if (entries.length === 0) return null;

  return entries
    .slice(0, 3)
    .map(([field, message]) => `${FIELD_LABELS[field]}: ${message}`)
    .join(' · ');
}

function normalizeIssueMessage(issue: BackendValidationIssue): string {
  const raw = issue.msg?.trim();
  if (raw) return raw;
  return toArabicMessageKeyFallback(issue.messageKey ?? null, 'قيمة غير صالحة.');
}

function mapValidationIssues(issues: BackendValidationIssue[]): Partial<Record<AdminFacilityFormName, string>> {
  const fields: Partial<Record<AdminFacilityFormName, string>> = {};

  for (const issue of issues) {
    const key = issue.path ? PATH_TO_FIELD[issue.path] : undefined;
    if (!key || fields[key]) continue;
    fields[key] = normalizeIssueMessage(issue);
  }

  return fields;
}

export function resolveAdminFacilityFormFeedback(
  error: unknown,
  mode: 'create' | 'edit' = 'create',
): AdminFacilityFormFeedback {
  const actionLabel = mode === 'create' ? 'إضافة المنشأة' : 'حفظ التعديلات';

  if (!(error instanceof ApiError)) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'تعذر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.';
    return {
      fields: {},
      rootBanner: message,
      toastTitle: actionLabel,
      toastMessage: message,
    };
  }

  const issues = readValidationIssueArray(error.body.errors);
  const fields = mapValidationIssues(issues);

  if (error.status === 401) {
    return {
      fields: {},
      rootBanner: 'انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد المحاولة.',
      toastTitle: actionLabel,
      toastMessage: 'انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة تنفيذ التعديل على المنشأة.',
    };
  }

  if (error.status === 403) {
    return {
      fields: {},
      rootBanner: 'ليست لديك صلاحية إدارة هذه المنشأة أو تعديل حالتها حالياً.',
      toastTitle: actionLabel,
      toastMessage: 'هذا الحساب لا يملك صلاحية إنشاء المنشأة أو تعديلها أو حذفها أو تغيير حالتها حالياً.',
    };
  }

  if (error.status === 404) {
    return {
      fields: {},
      rootBanner: 'تعذر العثور على المنشأة المطلوبة، أو لم تعد متاحة لهذا الإجراء.',
      toastTitle: actionLabel,
      toastMessage: 'تعذر العثور على المنشأة المطلوبة، أو لم تعد متاحة لهذا التعديل أو الحذف أو تغيير الحالة.',
    };
  }

  if (error.messageKey === 'errors.validationFailed' || error.status === 422) {
    const summary =
      summarizeFieldErrors(fields) ??
      'راجع الحقول المطلوبة وتأكد من أن القيم تطابق قواعد التحقق في الخادم.';
    return {
      fields,
      rootBanner: 'بعض الحقول تحتاج إلى تصحيح قبل المتابعة.',
      toastTitle: 'بيانات غير مكتملة',
      toastMessage: summary,
    };
  }

  if (error.messageKey === 'errors.validation.invalidId') {
    return {
      fields: { ownerDoctorId: 'أدخل معرّف طبيب صالحًا أو اترك الحقل فارغًا.' },
      rootBanner: 'أحد المعرّفات المرسلة غير صالح.',
      toastTitle: actionLabel,
      toastMessage: 'يوجد معرّف غير صالح في الطلب. تحقق من معرّف الطبيب المالك أو أعد تحميل الصفحة.',
    };
  }

  if (error.messageKey === 'errors.validation.invalidEnum') {
    return {
      fields: {
        facilityType: 'اختر نوع منشأة من القائمة فقط.',
        status: 'اختر حالة مدعومة من القائمة.',
      },
      rootBanner: 'أحد الاختيارات المحددة غير مدعوم من الخادم.',
      toastTitle: actionLabel,
      toastMessage: 'نوع المنشأة أو الحالة أو أحد القيم المحددة غير مدعوم. راجع الاختيارات ثم أعد المحاولة.',
    };
  }

  if (error.messageKey === 'errors.facilities.invalidAttributeKey') {
    return {
      fields: { attributes: 'أزل السمات الفارغة أو غير القياسية، ثم أعد المحاولة.' },
      rootBanner: 'إحدى السمات المدخلة غير مقبولة بعد التطبيع.',
      toastTitle: actionLabel,
      toastMessage: 'السمات يجب أن تكون مفاتيح نصية صالحة مثل night_shift أو echo_available.',
    };
  }

  if (error.messageKey === 'errors.facilities.ownerFacilityExists') {
    return {
      fields: { ownerDoctorId: 'هذا الطبيب يملك منشأة أخرى بالفعل.' },
      rootBanner: 'تعذر ربط الطبيب المحدد بهذه المنشأة.',
      toastTitle: actionLabel,
      toastMessage: 'الطبيب المحدد يملك منشأة أخرى غير محذوفة. اختر طبيبًا آخر أو أزل الربط.',
    };
  }

  if (error.status === 400 && Object.keys(fields).length > 0) {
    return {
      fields,
      rootBanner: 'بعض قيم النموذج غير صالحة.',
      toastTitle: actionLabel,
      toastMessage: summarizeFieldErrors(fields) ?? 'تحقق من القيم المدخلة ثم أعد المحاولة.',
    };
  }

  const message = toArabicMessageKeyFallback(error.messageKey, error.message);

  return {
    fields,
    rootBanner: message,
    toastTitle: actionLabel,
    toastMessage: message,
  };
}
