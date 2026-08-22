import { ApiError } from "@/lib/api";

export function getAppointmentErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "طلب غير صالح. يرجى التحقق من البيانات المُدخلة.";
      case 401:
        return "غير مصرح. يرجى تسجيل الدخول مرة أخرى.";
      case 403:
        return "ليس لديك صلاحية للوصول إلى هذه المواعيد.";
      case 404:
        return "الموعد المطلوب غير موجود.";
      case 409:
        return "تعارض في البيانات. قد يكون الموعد محجوزاً بالفعل.";
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

export function getAppointmentCancelErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        if (error.message?.includes("within 1 hour")) {
          return "لا يمكن إلغاء الموعد خلال ساعة واحدة من وقت البدء.";
        }
        if (error.message?.includes("completed")) {
          return "لا يمكن إلغاء المواعيد المكتملة.";
        }
        if (error.message?.includes("no-show")) {
          return "لا يمكن إلغاء المواعيد المسجلة كـ عدم حضور.";
        }
        return "طلب غير صالح.";
      case 403:
        return "ليس لديك صلاحية لإلغاء هذا الموعد.";
      case 404:
        return "الموعد المطلوب غير موجود.";
      default:
        return getAppointmentErrorMessage(error);
    }
  }

  return getAppointmentErrorMessage(error);
}
