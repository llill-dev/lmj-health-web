import { ApiError } from "@/lib/api";
import { getCurrentLocale } from "@/i18n/runtime";

/** بادئات قديمة أو من مصادر أخرى لا نريد إظهارها للمشرف */
const RE_AR_STATUS = /^خطأ\s*\d+\s*:\s*/u;
const RE_EN_STATUS = /^Error\s+\d+:\s*/i;
const RE_AR_UPLOAD = /^خطأ رفع:\s*\d+/u;
const RE_EN_UPLOAD = /^Upload error:\s*\d+/i;

/**
 * يزيل بادئة رمز HTTP من نص رسالة (عربي/إنجليزي) لعرضها في واجهة الإدارة.
 */
export function stripHttpStatusFromMessage(s: string): string {
  let t = s.trim();
  if (!t) return t;
  t = t.replace(RE_AR_STATUS, "");
  t = t.replace(RE_EN_STATUS, "");
  t = t.replace(RE_AR_UPLOAD, "تعذّر رفع الملف");
  t = t.replace(RE_EN_UPLOAD, "Upload failed");
  return t.trim();
}

export type FieldValidationError = { field?: string; message: string };

/**
 * بعض استجابات الباك-إند تُعيد نصوص تحقّق تقنية خام (من مكتبة تحقق مثل zod)
 * من نوع "Invalid input: expected string, received undefined". هذه النصوص
 * تقنية بحتة ولا تُفهم من المستخدم العربي، وعرضها مباشرة يخالف سياسة عدم
 * إظهار أخطاء تقنية خام للمستخدم — نستبدلها برسالة عربية عامة وواضحة.
 */
const TECHNICAL_MESSAGE_RE =
  /invalid input|invalid_type|expected .+ received|^required$|is not a valid|must be a (string|number|boolean|array|object)/i;

export function isTechnicalValidationMessage(message: string): boolean {
  return TECHNICAL_MESSAGE_RE.test(message);
}

function humanizeValidationMessage(message: string): string {
  if (!isTechnicalValidationMessage(message)) return message;
  return getCurrentLocale() === "en"
    ? "Please enter a valid value for this field."
    : "يرجى إدخال قيمة صحيحة لهذا الحقل.";
}

/**
 * يستخرج أخطاء التحقق من الحقول المحددة من استجابة API 422، مع الاحتفاظ
 * بمسار الحقل (field) عند توفره ليتمكّن المستدعي من ربط الخطأ بالمُدخل
 * الصحيح بدل عرضه كرسالة عامة فقط.
 */
/**
 * شكل عنصر خطأ التحقق كما يُعيده الباك-إند فعليًا (express-validator):
 * `{ type, path, location, msg, messageKey }`. بعض المسارات القديمة/التجريبية
 * قد تُعيد شكلًا مبسّطًا `{ field, message }` بدلًا من ذلك، لذا ندعم الاثنين
 * معًا بدل افتراض شكل واحد فقط.
 */
type RawValidationIssue = {
  field?: string;
  message?: string;
  path?: string;
  msg?: string;
};

export function extractFieldValidationErrors(
  err: unknown,
): FieldValidationError[] {
  if (!(err instanceof ApiError) || err.status !== 422) return [];
  const errors = err.body.errors as RawValidationIssue[] | undefined;
  if (!Array.isArray(errors) || errors.length === 0) return [];

  return errors
    .map((e) => ({
      field: e.field ?? e.path,
      message: (e.message ?? e.msg ?? "").trim(),
    }))
    .filter((e) => e.message.length > 0)
    .map((e) => ({
      field: e.field,
      message: humanizeValidationMessage(stripHttpStatusFromMessage(e.message)),
    }))
    .filter((e) => e.message.length > 0);
}

function extractValidationErrors(err: ApiError): string[] {
  return extractFieldValidationErrors(err).map((e) => e.message);
}

/**
 * رسالة خطأ آمنة للمشرف: بدون رموز HTTP في النص المعروض.
 */
export function userFacingErrorMessage(
  err: unknown,
  fallback?: string,
): string {
  const locale = getCurrentLocale();
  const fallbackMessage =
    fallback
    || (locale === "ar" ? "تعذّر إكمال العملية." : "Could not complete the operation.");
  if (err == null) return fallbackMessage;

  // Handle 422 validation errors with field-specific messages
  if (err instanceof ApiError && err.status === 422) {
    const validationErrors = extractValidationErrors(err);
    if (validationErrors.length > 0) {
      return validationErrors.join(" • ");
    }
  }

  if (typeof err === "string") {
    const u = stripHttpStatusFromMessage(err);
    return u || fallbackMessage;
  }
  if (err instanceof ApiError) {
    const u = stripHttpStatusFromMessage(err.message);
    return u || fallbackMessage;
  }
  if (err instanceof Error) {
    const u = stripHttpStatusFromMessage(err.message);
    return u || fallbackMessage;
  }
  return fallbackMessage;
}
