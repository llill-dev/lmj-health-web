import { ApiError } from '@/lib/api';

type SupportedLocale = 'ar' | 'en';

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === 'en' ? en : ar;
}

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

const FIELD_LABELS_AR: Record<AdminFacilityFormName, string> = {
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

const FIELD_LABELS_EN: Record<AdminFacilityFormName, string> = {
  name: 'Facility name',
  facilityType: 'Facility type',
  city: 'City',
  country: 'Country',
  address: 'Address',
  phone: 'Phone number',
  description: 'Description',
  status: 'Status',
  ownerDoctorId: 'Owner doctor ID',
  attributes: 'Facility attributes',
};

function fieldLabels(locale: SupportedLocale): Record<AdminFacilityFormName, string> {
  return locale === 'en' ? FIELD_LABELS_EN : FIELD_LABELS_AR;
}

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

function toArabicMessageKeyFallback(
  messageKey: string | null,
  fallback: string,
  locale: SupportedLocale = 'ar',
): string {
  switch (messageKey) {
    case 'errors.validation.invalidId':
      return tr(locale, 'القيمة المدخلة تحتوي على معرّف غير صالح.', 'The entered value contains an invalid identifier.');
    case 'errors.validation.invalidEnum':
      return tr(locale, 'الاختيار المحدد غير مدعوم في النظام.', 'The selected option is not supported by the system.');
    case 'errors.facilities.invalidAttributeKey':
      return tr(locale, 'إحدى السمات غير صالحة بعد التطبيع.', 'One of the attributes is invalid after normalization.');
    case 'errors.facilities.ownerFacilityExists':
      return tr(locale, 'الطبيب المحدد يملك منشأة أخرى بالفعل.', 'The selected doctor already owns another facility.');
    case 'errors.facilities.notFound':
      return tr(locale, 'تعذر العثور على المنشأة المطلوبة.', 'The requested facility could not be found.');
    case 'errors.forbidden':
    case 'errors.facilities.ownerOnly':
      return tr(locale, 'ليست لديك صلاحية لتنفيذ هذه العملية.', 'You do not have permission to perform this action.');
    case 'errors.auth.notAuthenticated':
    case 'errors.auth.sessionExpired':
      return tr(
        locale,
        'انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.',
        'Your session has expired. Sign in again and try again.',
      );
    default:
      return fallback;
  }
}

function summarizeFieldErrors(
  fields: Partial<Record<AdminFacilityFormName, string>>,
  locale: SupportedLocale = 'ar',
): string | null {
  const entries = Object.entries(fields).filter(
    (entry): entry is [AdminFacilityFormName, string] =>
      typeof entry[1] === 'string' && entry[1].trim().length > 0,
  );
  if (entries.length === 0) return null;

  const labels = fieldLabels(locale);
  return entries
    .slice(0, 3)
    .map(([field, message]) => `${labels[field]}: ${message}`)
    .join(' · ');
}

function normalizeIssueMessage(
  issue: BackendValidationIssue,
  locale: SupportedLocale = 'ar',
): string {
  const raw = issue.msg?.trim();
  if (raw) return raw;
  return toArabicMessageKeyFallback(
    issue.messageKey ?? null,
    tr(locale, 'قيمة غير صالحة.', 'Invalid value.'),
    locale,
  );
}

function mapValidationIssues(
  issues: BackendValidationIssue[],
  locale: SupportedLocale = 'ar',
): Partial<Record<AdminFacilityFormName, string>> {
  const fields: Partial<Record<AdminFacilityFormName, string>> = {};

  for (const issue of issues) {
    const key = issue.path ? PATH_TO_FIELD[issue.path] : undefined;
    if (!key || fields[key]) continue;
    fields[key] = normalizeIssueMessage(issue, locale);
  }

  return fields;
}

export function resolveAdminFacilityFormFeedback(
  error: unknown,
  mode: 'create' | 'edit' = 'create',
  locale: SupportedLocale = 'ar',
): AdminFacilityFormFeedback {
  const actionLabel = tr(locale, mode === 'create' ? 'إضافة المنشأة' : 'حفظ التعديلات', mode === 'create' ? 'Add facility' : 'Save changes');

  if (!(error instanceof ApiError)) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : tr(
            locale,
            'تعذر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.',
            'Could not reach the server. Check your network and try again.',
          );
    return {
      fields: {},
      rootBanner: message,
      toastTitle: actionLabel,
      toastMessage: message,
    };
  }

  const issues = readValidationIssueArray(error.body.errors);
  const fields = mapValidationIssues(issues, locale);

  if (error.status === 401) {
    return {
      fields: {},
      rootBanner: tr(
        locale,
        'انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد المحاولة.',
        'Your admin session has expired. Sign in again and try again.',
      ),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة تنفيذ التعديل على المنشأة.',
        'Your admin session has expired. Sign in again and retry the change to the facility.',
      ),
    };
  }

  if (error.status === 403) {
    return {
      fields: {},
      rootBanner: tr(
        locale,
        'ليست لديك صلاحية إدارة هذه المنشأة أو تعديل حالتها حالياً.',
        'You do not currently have permission to manage this facility or change its status.',
      ),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'هذا الحساب لا يملك صلاحية إنشاء المنشأة أو تعديلها أو حذفها أو تغيير حالتها حالياً.',
        'This account does not have permission to create, edit, delete, or change the status of the facility right now.',
      ),
    };
  }

  if (error.status === 404) {
    return {
      fields: {},
      rootBanner: tr(
        locale,
        'تعذر العثور على المنشأة المطلوبة، أو لم تعد متاحة لهذا الإجراء.',
        'The requested facility could not be found, or is no longer available for this action.',
      ),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'تعذر العثور على المنشأة المطلوبة، أو لم تعد متاحة لهذا التعديل أو الحذف أو تغيير الحالة.',
        'The requested facility could not be found, or is no longer available for this edit, deletion, or status change.',
      ),
    };
  }

  if (error.messageKey === 'errors.validationFailed' || error.status === 422) {
    const summary =
      summarizeFieldErrors(fields, locale) ??
      tr(
        locale,
        'راجع الحقول المطلوبة وتأكد من أن القيم تطابق قواعد التحقق في الخادم.',
        'Review the required fields and make sure the values match the server validation rules.',
      );
    return {
      fields,
      rootBanner: tr(locale, 'بعض الحقول تحتاج إلى تصحيح قبل المتابعة.', 'Some fields need correction before continuing.'),
      toastTitle: tr(locale, 'بيانات غير مكتملة', 'Incomplete data'),
      toastMessage: summary,
    };
  }

  if (error.messageKey === 'errors.validation.invalidId') {
    return {
      fields: {
        ownerDoctorId: tr(
          locale,
          'أدخل معرّف طبيب صالحًا أو اترك الحقل فارغًا.',
          'Enter a valid doctor ID or leave the field empty.',
        ),
      },
      rootBanner: tr(locale, 'أحد المعرّفات المرسلة غير صالح.', 'One of the submitted identifiers is invalid.'),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'يوجد معرّف غير صالح في الطلب. تحقق من معرّف الطبيب المالك أو أعد تحميل الصفحة.',
        'There is an invalid identifier in the request. Check the owner doctor ID or reload the page.',
      ),
    };
  }

  if (error.messageKey === 'errors.validation.invalidEnum') {
    return {
      fields: {
        facilityType: tr(locale, 'اختر نوع منشأة من القائمة فقط.', 'Choose a facility type from the list only.'),
        status: tr(locale, 'اختر حالة مدعومة من القائمة.', 'Choose a supported status from the list.'),
      },
      rootBanner: tr(locale, 'أحد الاختيارات المحددة غير مدعوم من الخادم.', 'One of the selected options is not supported by the server.'),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'نوع المنشأة أو الحالة أو أحد القيم المحددة غير مدعوم. راجع الاختيارات ثم أعد المحاولة.',
        'The facility type, status, or one of the selected values is not supported. Review the choices and try again.',
      ),
    };
  }

  if (error.messageKey === 'errors.facilities.invalidAttributeKey') {
    return {
      fields: {
        attributes: tr(
          locale,
          'أزل السمات الفارغة أو غير القياسية، ثم أعد المحاولة.',
          'Remove any empty or non-standard attributes, then try again.',
        ),
      },
      rootBanner: tr(locale, 'إحدى السمات المدخلة غير مقبولة بعد التطبيع.', 'One of the entered attributes is not accepted after normalization.'),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'السمات يجب أن تكون مفاتيح نصية صالحة مثل night_shift أو echo_available.',
        'Attributes must be valid text keys such as night_shift or echo_available.',
      ),
    };
  }

  if (error.messageKey === 'errors.facilities.ownerFacilityExists') {
    return {
      fields: {
        ownerDoctorId: tr(locale, 'هذا الطبيب يملك منشأة أخرى بالفعل.', 'This doctor already owns another facility.'),
      },
      rootBanner: tr(locale, 'تعذر ربط الطبيب المحدد بهذه المنشأة.', 'Could not link the selected doctor to this facility.'),
      toastTitle: actionLabel,
      toastMessage: tr(
        locale,
        'الطبيب المحدد يملك منشأة أخرى غير محذوفة. اختر طبيبًا آخر أو أزل الربط.',
        'The selected doctor owns another non-deleted facility. Choose a different doctor or remove the link.',
      ),
    };
  }

  if (error.status === 400 && Object.keys(fields).length > 0) {
    return {
      fields,
      rootBanner: tr(locale, 'بعض قيم النموذج غير صالحة.', 'Some form values are invalid.'),
      toastTitle: actionLabel,
      toastMessage:
        summarizeFieldErrors(fields, locale) ??
        tr(locale, 'تحقق من القيم المدخلة ثم أعد المحاولة.', 'Check the entered values and try again.'),
    };
  }

  const message = toArabicMessageKeyFallback(error.messageKey, error.message, locale);

  return {
    fields,
    rootBanner: message,
    toastTitle: actionLabel,
    toastMessage: message,
  };
}
