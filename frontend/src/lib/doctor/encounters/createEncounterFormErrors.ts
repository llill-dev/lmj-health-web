import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

export type CreateEncounterFormField =
  | 'patientId'
  | 'origin'
  | 'appointmentId'
  | 'notes';

export type CreateEncounterServerFieldMessages = Partial<
  Record<CreateEncounterFormField, string>
>;

type EncounterValidationErrorRecord = {
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

function asEncounterValidationErrorRecord(
  value: unknown,
): EncounterValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as EncounterValidationErrorRecord)
    : null;
}

export class CreateEncounterSubmitError extends Error {
  readonly fields: CreateEncounterServerFieldMessages;

  constructor(
    fields: CreateEncounterServerFieldMessages,
    message: string,
  ) {
    super(message);
    this.name = 'CreateEncounterSubmitError';
    this.fields = fields;
  }
}

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

export function isValidAppointmentObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value.trim());
}

function collectStructuredFieldTexts(
  body: EncounterValidationErrorRecord,
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
      const row = asEncounterValidationErrorRecord(item);
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

function mapStructuredLeafToField(
  leaf: string,
): CreateEncounterFormField | null {
  const normalized = leaf.toLowerCase();
  if (normalized.includes('appointment')) return 'appointmentId';
  if (normalized.includes('patient')) return 'patientId';
  if (normalized === 'origin' || normalized.includes('origin')) return 'origin';
  if (normalized.includes('note')) return 'notes';
  return null;
}

function messageTargetsAppointmentId(text: string): boolean {
  return (
    /appointment/i.test(text) ||
    /موعد/.test(text) ||
    /invalidid/i.test(text) ||
    /errors\.validation\.invalidid/i.test(text) ||
    /errors\.encounter\.appointment/i.test(text)
  );
}

export function resolveCreateEncounterServerFeedback(
  error: unknown,
  t: TFn = defaultT,
): {
  toastMessage: string;
  fields: CreateEncounterServerFieldMessages;
} {
  const locale = getCurrentLocale();
  const toastMessage = getUserFacingRequestErrorMessage(error, locale);
  const fields: CreateEncounterServerFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    if (leaf === '_root') continue;
    const target = mapStructuredLeafToField(leaf);
    if (target && !fields[target]) fields[target] = msg;
  }

  if (
    messageKey.includes('invalidid') ||
    messageKey.includes('appointmentalreadylinked') ||
    messageKey.includes('appointmentnotfound') ||
    messageTargetsAppointmentId(combined)
  ) {
    fields.appointmentId =
      fields.appointmentId ??
      toastMessage ??
      t('doctor.createEncounterFormErrors.invalidAppointmentId');
  }

  if (messageKey.includes('invalidenum') && !fields.origin) {
    fields.origin = toastMessage || t('doctor.createEncounterFormErrors.originNotSupported');
  }

  if (
    error.status === 422 &&
    !fields.appointmentId &&
    messageTargetsAppointmentId(toastMessage)
  ) {
    fields.appointmentId = toastMessage;
  }

  return { toastMessage, fields };
}
