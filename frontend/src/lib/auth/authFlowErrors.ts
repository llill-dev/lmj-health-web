import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";

type SupportedLocale = "ar" | "en";

function tr(locale: SupportedLocale, ar: string, en: string): string {
  return locale === "ar" ? ar : en;
}

export function getForgotPasswordRequestErrorMessage(
  error: unknown,
  locale: SupportedLocale,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return tr(
        locale,
        "لا يوجد حساب مطابق لهذه البيانات. تحقق من البريد أو رقم الهاتف ثم أعد المحاولة.",
        "No account matches those details. Check the email or phone number and try again.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إرسال رمز إعادة التعيين بسبب بيانات غير صالحة. راجع الحقول ثم أعد المحاولة.",
        "We could not send the reset code because some details are invalid. Review the fields and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getResetPasswordErrorMessage(
  error: unknown,
  locale: SupportedLocale,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return tr(
        locale,
        "رابط أو رمز إعادة التعيين لم يعد صالحاً. اطلب رمزاً جديداً ثم أعد المحاولة.",
        "This reset link or code is no longer valid. Request a new code and try again.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر تعيين كلمة المرور لأن البيانات غير مطابقة لمتطلبات الخادم. راجع كلمة المرور ثم أعد المحاولة.",
        "We could not set the password because the data does not meet server validation rules. Review the password and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getClaimAccountRequestErrorMessage(
  error: unknown,
  locale: SupportedLocale,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return tr(
        locale,
        "لم نجد حساباً قابلاً للتفعيل بهذه البيانات. تحقق من البريد أو رقم الهاتف أو تواصل مع الدعم.",
        "We could not find an account ready to be activated with those details. Check the email or phone number or contact support.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "تعذر إرسال رمز التفعيل بسبب بيانات غير صالحة. راجع الحقول ثم أعد المحاولة.",
        "We could not send the activation code because some details are invalid. Review the fields and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}

export function getClaimAccountVerifyErrorMessage(
  error: unknown,
  locale: SupportedLocale,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return tr(
        locale,
        "طلب التفعيل لم يعد متاحاً أو انتهت صلاحيته. اطلب رمزاً جديداً ثم أعد المحاولة.",
        "This activation request is no longer available or has expired. Request a new code and try again.",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "رمز التفعيل أو كلمة المرور غير مطابقين لمتطلبات الخادم. تحقق من الرمز والحقول ثم أعد المحاولة.",
        "The activation code or password does not meet server validation rules. Check the code and fields and try again.",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
