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

export function getForgotPasswordRequestErrorMessage(
  error: unknown,
  locale: SupportedLocale,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return tr(
        locale,
        "auth.forgotPassword.notFound",
        "auth.forgotPassword.notFoundEn",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "auth.forgotPassword.validationError",
        "auth.forgotPassword.validationErrorEn",
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
        "auth.resetPassword.notFound",
        "auth.resetPassword.notFoundEn",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "auth.resetPassword.validationError",
        "auth.resetPassword.validationErrorEn",
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
        "auth.claimAccountRequest.notFound",
        "auth.claimAccountRequest.notFoundEn",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "auth.claimAccountRequest.validationError",
        "auth.claimAccountRequest.validationErrorEn",
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
        "auth.claimAccountVerify.notFound",
        "auth.claimAccountVerify.notFoundEn",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        "auth.claimAccountVerify.validationError",
        "auth.claimAccountVerify.validationErrorEn",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
