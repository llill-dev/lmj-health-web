import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

export type PrescriptionFormField = 'generalInstructions';

export type PrescriptionServerFieldMessages = Partial<
  Record<PrescriptionFormField, string>
>;

type PrescriptionValidationErrorRecord = {
  errors?: unknown;
  path?: unknown;
  param?: unknown;
  field?: unknown;
  property?: unknown;
  propertyName?: unknown;
  message?: unknown;
  msg?: unknown;
  [key: string]: unknown;
};

function asPrescriptionValidationErrorRecord(
  value: unknown,
): PrescriptionValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as PrescriptionValidationErrorRecord)
    : null;
}

function readPrescriptionValidationString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readPrescriptionValidationLeaf(value: unknown): string {
  if (Array.isArray(value)) {
    return readPrescriptionValidationString(value[value.length - 1]) ?? '';
  }

  const path = readPrescriptionValidationString(value);
  return path?.replace(/[[\]/]+/g, '.').split('.').filter(Boolean).at(-1) ?? path ?? '';
}

function collectStructuredFieldTexts(
  body: PrescriptionValidationErrorRecord,
): Map<string, string> {
  const out = new Map<string, string>();
  const errs = body.errors;

  function push(leaf: string, msg: string) {
    const text = msg.trim();
    if (!text) return;
    const current = out.get(leaf);
    if (!current) out.set(leaf, text);
    else if (!current.includes(text)) out.set(leaf, `${current} ${text}`.trim());
  }

  if (errs == null) return out;

  if (typeof errs === 'string') {
    push('_root', errs);
    return out;
  }

  if (Array.isArray(errs)) {
    for (const item of errs) {
      if (typeof item === 'string') {
        push('_root', item);
        continue;
      }

      const row = asPrescriptionValidationErrorRecord(item);
      if (!row) continue;

      const pathVal =
        row.path ?? row.param ?? row.field ?? row.property ?? row.propertyName;
      const leaf = readPrescriptionValidationLeaf(pathVal);
      const msg =
        readPrescriptionValidationString(row.message) ||
        readPrescriptionValidationString(row.msg) ||
        '';

      push(leaf || '_root', msg);
    }
    return out;
  }

  if (typeof errs === 'object') {
    for (const [key, value] of Object.entries(errs)) {
      if (typeof value === 'string') push(key, value);
      else if (Array.isArray(value)) {
        push(
          key,
          value
            .map((entry) => readPrescriptionValidationString(entry))
            .filter((entry): entry is string => Boolean(entry))
            .join(getCurrentLocale() === 'ar' ? '، ' : ', '),
        );
      }
    }
  }

  return out;
}

function mapLeafToPrescriptionField(
  leaf: string,
): PrescriptionFormField | null {
  const normalized = leaf.toLowerCase();
  if (
    normalized.includes('generalinstruction') ||
    normalized === 'general_instructions'
  ) {
    return 'generalInstructions';
  }
  return null;
}

function messageTargetsGeneralInstructions(text: string): boolean {
  return (
    /generalinstruction/i.test(text) ||
    /تعليمات عامة/.test(text) ||
    (/تعليمات/.test(text) && /عامة/.test(text))
  );
}

export function resolvePrescriptionSaveFeedback(
  error: unknown,
  t: TFn = defaultT,
): {
  toastMessage: string;
  fields: PrescriptionServerFieldMessages;
} {
  const locale = getCurrentLocale();
  const toastMessage = getUserFacingRequestErrorMessage(error, locale);
  const fields: PrescriptionServerFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    const target = mapLeafToPrescriptionField(leaf);
    if (target && !fields[target]) fields[target] = msg;
  }

  if (
    messageKey.includes('validation.required') ||
    messageTargetsGeneralInstructions(combined)
  ) {
    if (/generalinstruction|تعليمات عامة/i.test(combined)) {
      fields.generalInstructions =
        fields.generalInstructions ??
        t('doctor.prescriptionFormErrors.generalInstructionsOptional');
    }
  }

  return { toastMessage, fields };
}
