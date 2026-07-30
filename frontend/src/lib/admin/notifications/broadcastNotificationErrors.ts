import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";

type SupportedLocale = "ar" | "en";

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === "ar" ? ar : en;
}

export function getBroadcastNotificationErrorMessage(
  error: unknown,
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة بث الإشعار.",
        "Your admin session has expired. Sign in again and then retry broadcasting the notification.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية بث الإشعارات حالياً.",
        "This account is not allowed to broadcast notifications right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر الوصول إلى خدمة الإشعارات المطلوبة حالياً. أعد المحاولة لاحقاً.",
        "We could not reach the required notifications service right now. Please try again later.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إرسال الإشعار لأن بعض الحقول لا تطابق متطلبات الخادم. راجع المجموعة والنوع والعنوان والمحتوى ثم أعد المحاولة.",
        "We could not send the notification because some fields do not meet server validation rules. Review the audience, type, title, and body and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
