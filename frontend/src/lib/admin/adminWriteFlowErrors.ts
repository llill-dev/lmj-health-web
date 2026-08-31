import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { getTranslationValue } from "@/i18n/translations";
import { getCurrentLocale } from "@/i18n/runtime";

type SupportedLocale = "ar" | "en";

/**
 * Maps a 422 validation error response (`errors: ValidationIssue[]`, each with a
 * `path`/`msg`) onto a flat `{ [fieldPath]: message }` object so callers can attach
 * server errors to the specific field that failed instead of showing a generic toast.
 */
export function extractFieldValidationErrors(
  error: unknown,
): Record<string, string> | null {
  if (!(error instanceof ApiError)) return null;
  const issues = (error.body as { errors?: unknown } | undefined)?.errors;
  if (!Array.isArray(issues)) return null;

  const out: Record<string, string> = {};
  for (const issue of issues) {
    if (!issue || typeof issue !== "object") continue;
    const path = (issue as { path?: unknown }).path;
    const msg = (issue as { msg?: unknown }).msg;
    if (typeof path === "string" && path && typeof msg === "string" && msg) {
      out[path] = msg;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function tr(locale: SupportedLocale, ar: string, en: string): string {
  // Use centralized translation system with fallback to local strings
  const key = locale === "ar" ? ar : en;
  const translated = getTranslationValue(locale, key);
  if (translated) return translated;

  // Fallback to local strings
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
        "admin.reboard.sessionExpired",
        "admin.reboard.sessionExpiredEn",
      );
    }

    if (error.status === 403) {
      return tr(locale, "admin.reboard.forbidden", "admin.reboard.forbiddenEn");
    }

    if (error.status === 404) {
      return tr(locale, "admin.reboard.notFound", "admin.reboard.notFoundEn");
    }

    if (error.status === 422) {
      return tr(
        locale,
        "admin.reboard.validationError",
        "admin.reboard.validationErrorEn",
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
        "admin.serviceProvider.sessionExpired",
        "admin.serviceProvider.sessionExpiredEn",
      );
    }

    if (error.status === 403) {
      return tr(
        locale,
        action === "status"
          ? "admin.serviceProvider.statusForbidden"
          : "admin.serviceProvider.createEditForbidden",
        action === "status"
          ? "admin.serviceProvider.statusForbiddenEn"
          : "admin.serviceProvider.createEditForbiddenEn",
      );
    }

    if (error.status === 404) {
      return tr(
        locale,
        action === "create"
          ? "admin.serviceProvider.typeNotFound"
          : "admin.serviceProvider.notFound",
        action === "create"
          ? "admin.serviceProvider.typeNotFoundEn"
          : "admin.serviceProvider.notFoundEn",
      );
    }

    if (error.status === 422) {
      return tr(
        locale,
        action === "status"
          ? "admin.serviceProvider.statusValidationError"
          : action === "create"
            ? "admin.serviceProvider.createValidationError"
            : "admin.serviceProvider.updateValidationError",
        action === "status"
          ? "admin.serviceProvider.statusValidationErrorEn"
          : action === "create"
            ? "admin.serviceProvider.createValidationErrorEn"
            : "admin.serviceProvider.updateValidationErrorEn",
      );
    }
  }

  return getUserFacingRequestErrorMessage(error, locale);
}
