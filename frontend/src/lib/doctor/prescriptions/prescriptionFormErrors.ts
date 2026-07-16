import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';

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
    ? value
    : null;
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
      let leaf = '';
      if (Array.isArray(pathVal)) {
        leaf = String(pathVal[pathVal.length - 1] ?? '');
      } else if (typeof pathVal === 'string') {
        leaf = pathVal.split(/[.[\]/]/).filter(Boolean).at(-1) ?? pathVal;
      }
      const msg =
        (typeof row.message === 'string' && row.message.trim()) ||
        (typeof row.msg === 'string' && row.msg.trim()) ||
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
          value.filter((entry) => typeof entry === 'string').join('، '),
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

export function resolvePrescriptionSaveFeedback(error: unknown): {
  toastMessage: string;
  fields: PrescriptionServerFieldMessages;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
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
        'التعليمات العامة اختيارية. إن ظهر هذا الخطأ فغالباً لم يُحفظ شيء جديد — أضف دواءً أو عدّل التعليمات ثم أعد المحاولة.';
    }
  }

  return { toastMessage, fields };
}
