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
        "انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session expired. Sign in again and try once more.",
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
        "الحساب المطلوب غير موجود أو لم يعد متاحاً لإعادة التفعيل.",
        "The requested account was not found or is no longer available for reactivation.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذّر إعادة تفعيل الحساب. راجع البيانات ثم أعد المحاولة.",
        "Could not reactivate the account. Review the request data and try again.",
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
        "انتهت الجلسة. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session expired. Sign in again and try once more.",
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
          ? "نوع الخدمة المطلوب غير موجود."
          : "مزود الخدمة المطلوب غير موجود أو لم يعد متاحاً لهذا التعديل.",
        action === "create"
          ? "The selected service type was not found."
          : "The requested service provider was not found or is no longer available for this change.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "status"
          ? "تعذّر تحديث الحالة. راجع القيمة المحددة ثم أعد المحاولة."
          : action === "create"
            ? "تعذّر إنشاء مزود الخدمة. راجع النوع والاسم والموقع ثم أعد المحاولة."
            : "تعذّر حفظ مزود الخدمة. راجع الاسم والموقع والحالة ثم أعد المحاولة.",
        action === "status"
          ? "Could not update the status. Review the selected value and try again."
          : action === "create"
            ? "Could not create the service provider. Review the type, name, and location and try again."
            : "Could not save the service provider. Review the name, location, and status and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
