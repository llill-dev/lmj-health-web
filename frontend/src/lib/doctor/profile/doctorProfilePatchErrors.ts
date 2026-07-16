import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import type { DoctorPersonalEditForm } from '@/components/doctor/profile-settings/doctor-profile-schemas';

export type DoctorProfilePatchField = keyof DoctorPersonalEditForm;

export type DoctorProfilePatchFieldMessages = Partial<
  Record<DoctorProfilePatchField, string>
>;

type DoctorProfileValidationErrorRecord = {
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

function asDoctorProfileValidationErrorRecord(
  value: unknown,
): DoctorProfileValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorProfileValidationErrorRecord)
    : null;
}

function collectStructuredFieldTexts(
  body: DoctorProfileValidationErrorRecord,
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
      const row = asDoctorProfileValidationErrorRecord(item);
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

const FIELD_ALIASES: Record<string, DoctorProfilePatchField> = {
  fullname: 'fullName',
  dateofbirth: 'dateOfBirth',
  address: 'address',
  bio: 'bio',
  consultationfee: 'consultationFee',
  consultationtypes: 'consultationMode',
  consultationmode: 'consultationMode',
  phone: 'fullName',
};

function mapLeafToField(leaf: string): DoctorProfilePatchField | null {
  const normalized = leaf.replace(/[[\]]/g, '').toLowerCase();
  return FIELD_ALIASES[normalized] ?? null;
}

function humanizeValidationKey(msg: string): string | null {
  const key = msg.toLowerCase();
  if (key.includes('dateofbirth') || key.includes('invaliddate')) {
    return 'تاريخ الميلاد غير صالح.';
  }
  if (key.includes('consultationtypes') || key.includes('invalidenum')) {
    return 'نوع الاستشارة غير صالح.';
  }
  if (key.includes('consultationfee') || key.includes('invalidnumber')) {
    return 'تكلفة الاستشارة غير صالحة.';
  }
  if (key.includes('bio')) {
    return 'النبذة التعريفية غير صالحة.';
  }
  if (key.includes('fullname')) {
    return 'الاسم الكامل غير صالح.';
  }
  if (key.includes('address')) {
    return 'العنوان غير صالح.';
  }
  return null;
}

export function resolveDoctorProfilePatchFeedback(error: unknown): {
  toastMessage: string;
  fields: DoctorProfilePatchFieldMessages;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
  const fields: DoctorProfilePatchFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    if (leaf === '_root') {
      const hint = humanizeValidationKey(msg);
      if (hint && !fields.consultationMode) fields.consultationMode = hint;
      continue;
    }
    const target = mapLeafToField(leaf);
    const readable = humanizeValidationKey(msg) ?? msg;
    if (target && !fields[target]) fields[target] = readable;
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  if (combined.includes('consultationtypes') && !fields.consultationMode) {
    fields.consultationMode =
      toastMessage || 'نوع الاستشارة غير صالح. اختر خياراً واحداً.';
  }
  if (combined.includes('dateofbirth') && !fields.dateOfBirth) {
    fields.dateOfBirth = toastMessage || 'تاريخ الميلاد غير صالح.';
  }
  if (combined.includes('consultationfee') && !fields.consultationFee) {
    fields.consultationFee = toastMessage || 'تكلفة الاستشارة غير صالحة.';
  }

  return { toastMessage, fields };
}
