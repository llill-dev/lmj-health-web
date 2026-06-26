import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';

export type CreateEncounterFormField =
  | 'patientId'
  | 'origin'
  | 'appointmentId'
  | 'notes';

export type CreateEncounterServerFieldMessages = Partial<
  Record<CreateEncounterFormField, string>
>;

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
  body: Record<string, unknown>,
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
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
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

export function resolveCreateEncounterServerFeedback(error: unknown): {
  toastMessage: string;
  fields: CreateEncounterServerFieldMessages;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
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
      'رقم الموعد غير صالح أو غير موجود لدى هذا المريض.';
  }

  if (messageKey.includes('invalidenum') && !fields.origin) {
    fields.origin = toastMessage || 'نوع الزيارة غير مدعوم.';
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
