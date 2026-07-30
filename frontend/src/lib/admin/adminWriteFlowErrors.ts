import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";

type SupportedLocale = "ar" | "en";

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === "ar" ? ar : en;
}

export function getAdminReboardErrorMessage(
  error: unknown,
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة تفعيل الحساب.",
        "Your admin session has expired. Sign in again and then retry reactivating the account.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية إعادة تفعيل هذا المستخدم حالياً.",
        "This account is not allowed to reactivate this user right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على حساب المستخدم المطلوب، أو لم يعد متاحاً لإعادة التفعيل.",
        "We could not find the requested user account, or it is no longer available for reactivation.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إعادة تفعيل الحساب لأن الطلب لا يطابق متطلبات الخادم الحالية.",
        "We could not reactivate the account because the request does not meet current server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAdminServiceProviderMutationErrorMessage(
  error: unknown,
  action: "create" | "update" | "status",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة حفظ مزود الخدمة.",
        "Your admin session has expired. Sign in again and then retry saving the service provider.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "status"
          ? "هذا الحساب لا يملك صلاحية تغيير حالة مزود الخدمة حالياً."
          : "هذا الحساب لا يملك صلاحية إنشاء أو تعديل مزود الخدمة حالياً.",
        action === "status"
          ? "This account is not allowed to change the service provider status right now."
          : "This account is not allowed to create or edit this service provider right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "create"
          ? "تعذر العثور على نوع الخدمة المطلوب لإنشاء مزود الخدمة."
          : "تعذر العثور على مزود الخدمة المطلوب، أو لم يعد متاحاً لهذا التعديل.",
        action === "create"
          ? "We could not find the selected service type required to create this provider."
          : "We could not find the requested service provider, or it is no longer available for this change.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "status"
          ? "تعذر تحديث الحالة لأن القيمة المحددة لا تطابق متطلبات الخادم."
          : action === "create"
            ? "تعذر إنشاء مزود الخدمة لأن بعض البيانات لا تطابق متطلبات الخادم. راجع نوع الخدمة والاسم والموقع والحالة ثم أعد المحاولة."
            : "تعذر حفظ تعديلات مزود الخدمة لأن بعض البيانات لا تطابق متطلبات الخادم. راجع الاسم والموقع والحالة ثم أعد المحاولة.",
        action === "status"
          ? "We could not update the status because the selected value does not meet server validation rules."
          : action === "create"
            ? "We could not create the service provider because some details do not meet server validation rules. Review the service type, name, location, and status and try again."
            : "We could not save the service provider changes because some details do not meet server validation rules. Review the name, location, and status and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
