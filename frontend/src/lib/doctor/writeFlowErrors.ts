import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { getTranslationValue } from "@/i18n/translations";
import { getCurrentLocale } from "@/i18n/runtime";

type SupportedLocale = "ar" | "en";

function tr(locale: SupportedLocale, ar: string, en: string): string {
  // Use centralized translation system with fallback to local strings
  const key = locale === "ar" ? ar : en;
  const translated = getTranslationValue(locale, key);
  if (translated) return translated;

  // Fallback to local strings
  return locale === "ar" ? ar : en;
}

function isMissingStorageLinkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "missing download url" ||
      error.message === "missing_url")
  );
}

function isMissingAttachmentReferenceError(error: unknown): boolean {
  return (
    error instanceof Error && error.message === "missing attachment reference"
  );
}

export function getCreateTemporaryPatientErrorMessage(
  error: unknown,
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة إنشاء المريض المؤقت.",
        "Your session has expired. Sign in again and then retry creating the temporary patient.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية إنشاء مريض مؤقت أو ربطه حالياً.",
        "This account is not allowed to create or link a temporary patient right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على سياق الطبيب أو العيادة المطلوب لإكمال إنشاء المريض المؤقت.",
        "We could not find the doctor or clinic context required to create the temporary patient.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إنشاء المريض المؤقت لأن بعض البيانات لا تطابق متطلبات الخادم. راجع الاسم والبريد والهاتف ثم أعد المحاولة.",
        "We could not create the temporary patient because some details do not meet server validation rules. Review the name, email, and phone number and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getDoctorAccessRequestErrorMessage(
  error: unknown,
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد إرسال طلب الوصول.",
        "Your session has expired. Sign in again and then resend the access request.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية طلب الوصول الكامل لهذا المريض حالياً.",
        "This account is not allowed to request full access to this patient right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الطبيب أو المريض المطلوب لهذا الطلب، أو لم يعد هذا الربط متاحاً.",
        "We could not find the doctor or patient for this request, or this relationship is no longer available.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إرسال طلب الوصول لأن بيانات الطلب غير صالحة أو غير مكتملة. راجع السبب ثم أعد المحاولة.",
        "We could not submit the access request because the request data is invalid or incomplete. Review the reason and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getDoctorSecretaryMutationErrorMessage(
  error: unknown,
  action: "create" | "update" | "unassign",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session has expired. Sign in again and then try again.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "unassign"
          ? "هذا الحساب لا يملك صلاحية إلغاء ربط هذا السكرتير حالياً."
          : "هذا الحساب لا يملك صلاحية تعديل بيانات السكرتير أو صلاحياته حالياً.",
        action === "unassign"
          ? "This account is not allowed to unassign this secretary right now."
          : "This account is not allowed to change this secretary or their permissions right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على حساب السكرتير المطلوب أو لم يعد مرتبطاً بهذا الطبيب.",
        "We could not find the requested secretary account, or it is no longer linked to this doctor.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "create"
          ? "تعذر إنشاء السكرتير لأن بعض البيانات لا تطابق متطلبات الخادم. راجع الاسم والبريد وكلمة المرور والصلاحيات ثم أعد المحاولة."
          : "تعذر حفظ تعديل السكرتير لأن بعض البيانات لا تطابق متطلبات الخادم. راجع الحقول والصلاحيات ثم أعد المحاولة.",
        action === "create"
          ? "We could not create the secretary because some details do not meet server validation rules. Review the name, email, password, and permissions and try again."
          : "We could not save the secretary changes because some details do not meet server validation rules. Review the fields and permissions and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentTypeMutationErrorMessage(
  error: unknown,
  action: "create" | "update" | "delete",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session has expired. Sign in again and then try again.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية إدارة أنواع المواعيد لهذا الطبيب حالياً.",
        "This account is not allowed to manage this doctor's appointment types right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "delete"
          ? "تعذر العثور على نوع الموعد المطلوب للحذف أو لم يعد متاحاً."
          : "تعذر العثور على نوع الموعد المطلوب أو على ملف الطبيب المرتبط به.",
        action === "delete"
          ? "We could not find the appointment type to delete, or it is no longer available."
          : "We could not find the appointment type or the doctor record associated with it.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "delete"
          ? "تعذر حذف نوع الموعد لأن الطلب لم يطابق متطلبات الخادم."
          : "تعذر حفظ نوع الموعد لأن بعض البيانات لا تطابق متطلبات الخادم. راجع الاسم والسعر وحاول مجدداً.",
        action === "delete"
          ? "We could not delete the appointment type because the request did not meet server validation rules."
          : "We could not save the appointment type because some details do not meet server validation rules. Review the name and price and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getWorkScheduleMutationErrorMessage(
  error: unknown,
  action:
    | "add-day"
    | "update-day"
    | "delete-day"
    | "update-settings"
    | "add-exception"
    | "delete-exception",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد تعديل جدول العمل.",
        "Your session has expired. Sign in again and then retry the schedule change.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية تعديل جدول العمل أو إعدادات المواعيد لهذا الطبيب حالياً.",
        "This account is not allowed to change this doctor's schedule or slot settings right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "delete-exception"
          ? "تعذر العثور على الاستثناء المطلوب أو لم يعد موجوداً."
          : action === "delete-day"
            ? "تعذر العثور على يوم العمل المطلوب أو لم يعد موجوداً في الجدول."
            : "تعذر العثور على جدول الطبيب المطلوب لهذا التعديل.",
        action === "delete-exception"
          ? "We could not find the requested exception, or it no longer exists."
          : action === "delete-day"
            ? "We could not find the requested schedule day, or it is no longer in the schedule."
            : "We could not find the doctor's schedule for this change.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "update-settings"
          ? "تعذر حفظ إعدادات المواعيد لأن المدة أو الفجوة لا تطابق متطلبات الخادم."
          : action === "add-exception" || action === "delete-exception"
            ? "تعذر حفظ الاستثناء لأن بيانات التاريخ أو الساعات لا تطابق متطلبات الخادم."
            : "تعذر حفظ تعديل جدول العمل لأن اليوم أو الفترات المحددة لا تطابق متطلبات الخادم.",
        action === "update-settings"
          ? "We could not save the slot settings because the duration or gap does not meet server validation rules."
          : action === "add-exception" || action === "delete-exception"
            ? "We could not save the exception because the date or slot data does not meet server validation rules."
            : "We could not save the schedule change because the selected day or time slots do not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentBookingErrorMessage(
  error: unknown,
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة حجز الموعد.",
        "Your session has expired. Sign in again and then retry booking the appointment.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        "هذا الحساب لا يملك صلاحية حجز هذا الموعد حالياً.",
        "This account is not allowed to book this appointment right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الطبيب أو المريض أو نوع الموعد المطلوب لإتمام الحجز.",
        "We could not find the doctor, patient, or appointment type required to complete this booking.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر حجز الموعد لأن التاريخ أو الوقت أو نوع الموعد لا يطابق متطلبات الخادم. راجع البيانات ثم أعد المحاولة.",
        "We could not book the appointment because the date, time, or appointment type does not meet server validation rules. Review the details and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentWriteErrorMessage(
  error: unknown,
  action: "cancel" | "reschedule",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session has expired. Sign in again and then try again.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الموعد المطلوب أو لم يعد متاحاً لهذا الإجراء.",
        "We could not find the requested appointment, or it is no longer available for this action.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "cancel"
          ? "تعذر إلغاء الموعد لأن سبب الإلغاء أو حالة الموعد الحالية لا تطابق متطلبات الخادم."
          : "تعذر إعادة جدولة الموعد لأن التاريخ أو الوقت أو نوع الموعد الجديد لا يطابق متطلبات الخادم.",
        action === "cancel"
          ? "We could not cancel the appointment because the cancellation reason or current appointment state does not meet server validation rules."
          : "We could not reschedule the appointment because the new date, time, or appointment type does not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentStatusMutationErrorMessage(
  error: unknown,
  action: "complete" | "no-show",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 400 && action === "no-show") {
      return tr(
        locale,
        "لا يمكن تسجيل عدم حضور لموعد مستقبلي. انتظر حتى موعد الزيارة أو استخدم إعادة الجدولة إذا تغيّر الموعد.",
        "A future appointment cannot be marked as no-show. Wait until the visit time or use reschedule if the appointment changed.",
      );
    }

    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد المحاولة.",
        "Your session has expired. Sign in again and then try again.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "complete"
          ? "هذا الحساب لا يملك صلاحية إنهاء هذا الموعد حالياً."
          : "هذا الحساب لا يملك صلاحية تسجيل عدم حضور هذا الموعد حالياً.",
        action === "complete"
          ? "This account is not allowed to complete this appointment right now."
          : "This account is not allowed to mark this appointment as no-show right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الموعد المطلوب أو لم يعد متاحاً لهذا الإجراء.",
        "We could not find the requested appointment, or it is no longer available for this action.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "complete"
          ? "تعذر إنهاء الموعد لأن الملاحظات أو حالة الموعد الحالية لا تطابق متطلبات الخادم."
          : "تعذر تسجيل عدم الحضور لأن السبب أو حالة الموعد الحالية لا تطابق متطلبات الخادم.",
        action === "complete"
          ? "We could not complete the appointment because the notes or current appointment state does not meet server validation rules."
          : "We could not mark the appointment as no-show because the reason or current appointment state does not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentFileMutationErrorMessage(
  error: unknown,
  action: "upload" | "unlink",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة تعديل ملفات الموعد.",
        "Your session has expired. Sign in again and then retry changing the appointment files.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "upload"
          ? "هذا الحساب لا يملك صلاحية رفع ملف لهذا الموعد حالياً."
          : "هذا الحساب لا يملك صلاحية فك ربط هذا الملف من الموعد حالياً.",
        action === "upload"
          ? "This account is not allowed to upload a file for this appointment right now."
          : "This account is not allowed to unlink this file from the appointment right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "upload"
          ? "تعذر العثور على الموعد المطلوب لرفع الملف أو لم يعد متاحاً."
          : "تعذر العثور على الموعد أو الملف المطلوب لفك الربط، أو لم يعد متاحاً.",
        action === "upload"
          ? "We could not find the appointment required for this upload, or it is no longer available."
          : "We could not find the appointment or file required for unlinking, or it is no longer available.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "upload"
          ? "تعذر رفع الملف لأن بيانات الملف أو صيغة الطلب لا تطابق متطلبات الخادم."
          : "تعذر فك ربط الملف لأن الطلب لا يطابق متطلبات الخادم.",
        action === "upload"
          ? "We could not upload the file because the file data or request format does not meet server validation rules."
          : "We could not unlink the file because the request does not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getAppointmentFileAccessErrorMessage(
  error: unknown,
  action: "open" | "download",
  locale: SupportedLocale = "ar",
): string {
  if (isMissingStorageLinkError(error)) {
    return tr(
      locale,
      action === "open"
        ? "تعذر فتح الملف لأن خدمة التخزين لم تُرجع رابط عرض صالحاً حالياً. أعد المحاولة بعد قليل."
        : "تعذر تنزيل الملف لأن خدمة التخزين لم تُرجع رابط تنزيل صالحاً حالياً. أعد المحاولة بعد قليل.",
      action === "open"
        ? "We could not open the file because the storage service did not return a usable viewing link right now. Try again shortly."
        : "We could not download the file because the storage service did not return a usable download link right now. Try again shortly.",
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة الوصول إلى ملف الموعد.",
        "Your session has expired. Sign in again and then retry accessing the appointment file.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "open"
          ? "هذا الحساب لا يملك صلاحية فتح هذا الملف المرتبط بالموعد حالياً."
          : "هذا الحساب لا يملك صلاحية تنزيل هذا الملف المرتبط بالموعد حالياً.",
        action === "open"
          ? "This account is not allowed to open this appointment file right now."
          : "This account is not allowed to download this appointment file right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الموعد أو الملف المطلوب، أو لم يعد رابط الملف متاحاً.",
        "We could not find the appointment or file, or the file link is no longer available.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر الوصول إلى هذا الملف لأن الطلب لا يطابق متطلبات الخادم الحالية.",
        "We could not access this file because the request does not meet current server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getPatientFileMutationErrorMessage(
  error: unknown,
  action: "upload" | "delete",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة تعديل ملفات المريض.",
        "Your session has expired. Sign in again and then retry changing the patient files.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "upload"
          ? "هذا الحساب لا يملك صلاحية رفع ملف لهذا المريض حالياً."
          : "هذا الحساب لا يملك صلاحية حذف هذا الملف من سجلات المريض حالياً.",
        action === "upload"
          ? "This account is not allowed to upload a file for this patient right now."
          : "This account is not allowed to delete this file from the patient's records right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "upload"
          ? "تعذر العثور على المريض المطلوب لرفع الملف أو لم يعد متاحاً."
          : "تعذر العثور على المريض أو الملف المطلوب للحذف، أو لم يعد متاحاً.",
        action === "upload"
          ? "We could not find the patient required for this upload, or they are no longer available."
          : "We could not find the patient or file required for deletion, or it is no longer available.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "upload"
          ? "تعذر رفع الملف لأن بيانات الملف أو صيغة الطلب لا تطابق متطلبات الخادم."
          : "تعذر حذف الملف لأن الطلب لا يطابق متطلبات الخادم.",
        action === "upload"
          ? "We could not upload the file because the file data or request format does not meet server validation rules."
          : "We could not delete the file because the request does not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getPatientFileAccessErrorMessage(
  error: unknown,
  action: "open" | "download",
  locale: SupportedLocale = "ar",
): string {
  if (isMissingAttachmentReferenceError(error)) {
    return tr(
      locale,
      "هذا المرفق لا يحتوي على مرجع ملف صالح بعد، لذلك لا يمكن فتحه أو تنزيله حالياً.",
      "This attachment does not contain a valid file reference yet, so it cannot be opened or downloaded right now.",
    );
  }

  if (isMissingStorageLinkError(error)) {
    return tr(
      locale,
      action === "open"
        ? "تعذر فتح الملف لأن خدمة التخزين لم تُرجع رابط عرض صالحاً حالياً. أعد المحاولة بعد قليل."
        : "تعذر تنزيل الملف لأن خدمة التخزين لم تُرجع رابط تنزيل صالحاً حالياً. أعد المحاولة بعد قليل.",
      action === "open"
        ? "We could not open the file because the storage service did not return a usable viewing link right now. Try again shortly."
        : "We could not download the file because the storage service did not return a usable download link right now. Try again shortly.",
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة الوصول إلى ملف المريض.",
        "Your session has expired. Sign in again and then retry accessing the patient file.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "open"
          ? "هذا الحساب لا يملك صلاحية فتح هذا الملف من سجل المريض حالياً."
          : "هذا الحساب لا يملك صلاحية تنزيل هذا الملف من سجل المريض حالياً.",
        action === "open"
          ? "This account is not allowed to open this patient file right now."
          : "This account is not allowed to download this patient file right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على المريض أو الملف المطلوب، أو لم يعد رابط الملف متاحاً.",
        "We could not find the patient or file, or the file link is no longer available.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر الوصول إلى هذا الملف لأن الطلب لا يطابق متطلبات الخادم الحالية.",
        "We could not access this file because the request does not meet current server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getConsultationMutationErrorMessage(
  error: unknown,
  action: "send-message" | "close" | "dismiss",
  locale: SupportedLocale = "ar",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return tr(
        locale,
        "انتهت صلاحية جلسة الدخول. سجّل الدخول من جديد ثم أعد محاولة متابعة الاستشارة.",
        "Your session has expired. Sign in again and then retry the consultation action.",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "send-message"
          ? "هذا الحساب لا يملك صلاحية إرسال رد على هذه الاستشارة حالياً."
          : "هذا الحساب لا يملك صلاحية تغيير حالة هذه الاستشارة حالياً.",
        action === "send-message"
          ? "This account is not allowed to send a reply to this consultation right now."
          : "This account is not allowed to change this consultation's status right now.",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        "تعذر العثور على الاستشارة المطلوبة أو لم تعد متاحة لهذا الإجراء.",
        "We could not find the requested consultation, or it is no longer available for this action.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "send-message"
          ? "تعذر إرسال الرد لأن محتوى الرسالة أو المرفقات لا يطابق متطلبات الخادم."
          : action === "dismiss"
            ? "تعذر رفض الاستشارة لأن السبب أو الحالة الحالية لا يطابق متطلبات الخادم."
            : "تعذر إغلاق الاستشارة لأن حالتها الحالية لا تطابق متطلبات الخادم.",
        action === "send-message"
          ? "We could not send the reply because the message content or attachments do not meet server validation rules."
          : action === "dismiss"
            ? "We could not dismiss the consultation because the reason or current state does not meet server validation rules."
            : "We could not close the consultation because its current state does not meet server validation rules.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
