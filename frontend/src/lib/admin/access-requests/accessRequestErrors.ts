import { ApiError } from "@/lib/api";

export function getAccessRequestErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "طلب غير صالح. يرجى التحقق من البيانات المُدخلة.";
      case 401:
        return "غير مصرح. يرجى تسجيل الدخول مرة أخرى.";
      case 403:
        return "ليس لديك صلاحية للوصول إلى طلبات الوصول هذه.";
      case 404:
        return "طلب الوصول المطلوب غير موجود.";
      case 422:
        return "فشل التحقق من البيانات. يرجى التحقق من الحقول المطلوبة.";
      case 429:
        return "طلبات كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً.";
      case 500:
        return "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.";
      default:
        return error.message || "حدث خطأ غير متوقع.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "حدث خطأ غير متوقع.";
}
