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
        "انتهت صلاحية جلسة المشرف. سجّل الدخول من جديد ثم أعد محاولة مراجعة طلب التحقق.",
        "Your admin session has expired. Sign in again and then retry reviewing the verification request.",
      );
    }
    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية مراجعة طلبات التحقق حالياً.",
        "This account is not allowed to review verification requests right now.",
      );
    }
    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على طلب التحقق المطلوب، أو لم يعد متاحاً للمراجعة.",
        "We could not find the requested verification request, or it is no longer available for review.",
      );
    }
    if (error.status === 422) {
      return tr(
        locale,
        action === "approve"
          ? "تعذر اعتماد طلب التحقق لأن القرار أو ملاحظة المشرف أو بيانات التخصص أو الموقع لا تطابق متطلبات الخادم."
          : "تعذر رفض طلب التحقق لأن سبب الرفض أو بيانات المراجعة لا تطابق متطلبات الخادم.",
        action === "approve"
          ? "We could not approve the verification request because the decision, admin note, specialization, or location data does not meet server validation rules."
          : "We could not reject the verification request because the rejection reason or review data does not meet server validation rules.",
      );
    }
  }
  return getUserFacingRequestErrorMessage(error, locale);
}
