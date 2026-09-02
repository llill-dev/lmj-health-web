import { z } from "zod";
import { getCurrentLocale } from "@/i18n/runtime";
import { getTranslationValue } from "@/i18n/translations";

export const LATIN_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** @deprecated Arabic-only — use latinSlugMessage() for locale-aware messages. */
export const LATIN_SLUG_MESSAGE =
  "المعرّف يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط";

function latinSlugMessage(): string {
  return (
    getTranslationValue(getCurrentLocale(), "forms.slug.invalidFormat") ??
    LATIN_SLUG_MESSAGE
  );
}

function requiredSlugMessage(): string {
  return (
    getTranslationValue(getCurrentLocale(), "forms.slug.required") ??
    "المعرّف مطلوب"
  );
}

export function isValidLatinSlug(value: string): boolean {
  return LATIN_SLUG_REGEX.test(value.trim());
}

export function optionalLatinSlugSchema() {
  return z
    .string()
    .optional()
    .refine((value) => !value?.trim() || isValidLatinSlug(value), {
      message: latinSlugMessage(),
    });
}

export function requiredLatinSlugSchema(message = requiredSlugMessage()) {
  return z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => isValidLatinSlug(value), {
      message: latinSlugMessage(),
    });
}

/**
 * Best-effort slug suggestion from a Latin-script string (e.g. an English
 * name). Non-Latin input (Arabic, etc.) has no safe automatic
 * transliteration without a dedicated library, so it collapses to an empty
 * suggestion rather than producing a misleading slug.
 */
export function slugifyLatin(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
