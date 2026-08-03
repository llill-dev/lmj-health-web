import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";

type SupportedLocale = "ar" | "en";
type VerificationReviewAction = "approve" | "reject";

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === "ar" ? ar : en;
}

export function getVerificationReviewErrorMessage(
  error: unknown,
  action: VerificationReviewAction,
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
        "ليست لديك صلاحية مراجعة طلبات التحقق حالياً.",
        "You are not allowed to review verification requests right now.",
      );
    }
    if (error.status === 404) {
      return tr(
        locale,
        "طلب التحقق غير موجود أو لم يعد متاحاً للمراجعة.",
        "The verification request was not found or is no longer reviewable.",
      );
    }
    if (error.status === 422) {
      return tr(
        locale,
        action === "approve"
          ? "تعذّر قبول الطلب. راجع الملاحظة وبيانات التخصص أو الموقع ثم أعد المحاولة."
          : "تعذّر رفض الطلب. راجع سبب الرفض ثم أعد المحاولة.",
        action === "approve"
          ? "Could not approve the request. Review the note, specialization, or location data and try again."
          : "Could not reject the request. Review the rejection reason and try again.",
      );
    }
  }
  return getUserFacingRequestErrorMessage(error, locale);
}
