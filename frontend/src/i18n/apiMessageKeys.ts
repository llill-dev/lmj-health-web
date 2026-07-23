import type { AppLocale } from "@/i18n/runtime";
import { getTranslationValue } from "@/i18n/translations";

function normalizeMessageKey(messageKey: string): string {
  return messageKey.trim();
}

export function localizeApiMessageKey(
  messageKey: string | null | undefined,
  locale: AppLocale,
): string | null {
  if (!messageKey) return null;
  const normalized = normalizeMessageKey(messageKey);
  if (!normalized) return null;
  return getTranslationValue(locale, `api.messageKey.${normalized}`);
}
