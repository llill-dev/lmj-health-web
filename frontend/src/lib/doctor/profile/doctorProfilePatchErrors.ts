import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}
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

function humanizeValidationKey(msg: string, t: TFn): string | null {
  const key = msg.toLowerCase();
  if (key.includes('dateofbirth') || key.includes('invaliddate')) {
    return t('doctor.profilePatchErrors.invalidDateOfBirth');
  }
  if (key.includes('consultationtypes') || key.includes('invalidenum')) {
    return t('doctor.profilePatchErrors.invalidConsultationMode');
  }
  if (key.includes('consultationfee') || key.includes('invalidnumber')) {
    return t('doctor.profilePatchErrors.invalidConsultationFee');
  }
  if (key.includes('bio')) {
    return t('doctor.profilePatchErrors.invalidBio');
  }
  if (key.includes('fullname')) {
    return t('doctor.profilePatchErrors.invalidFullName');
  }
  if (key.includes('address')) {
    return t('doctor.profilePatchErrors.invalidAddress');
  }
  return null;
}

export function resolveDoctorProfilePatchFeedback(
  error: unknown,
  t: TFn = defaultT,
): {
  toastMessage: string;
  fields: DoctorProfilePatchFieldMessages;
} {
  const locale = getCurrentLocale();
  const toastMessage = getUserFacingRequestErrorMessage(error, locale);
  const fields: DoctorProfilePatchFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    if (leaf === '_root') {
      const hint = humanizeValidationKey(msg, t);
      if (hint && !fields.consultationMode) fields.consultationMode = hint;
      continue;
    }
    const target = mapLeafToField(leaf);
    const readable = humanizeValidationKey(msg, t) ?? msg;
    if (target && !fields[target]) fields[target] = readable;
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  if (combined.includes('consultationtypes') && !fields.consultationMode) {
    fields.consultationMode =
      toastMessage || t('doctor.profilePatchErrors.consultationModeRequired');
  }
  if (combined.includes('dateofbirth') && !fields.dateOfBirth) {
    fields.dateOfBirth = toastMessage || t('doctor.profilePatchErrors.invalidDateOfBirth');
  }
  if (combined.includes('consultationfee') && !fields.consultationFee) {
    fields.consultationFee = toastMessage || t('doctor.profilePatchErrors.invalidConsultationFee');
  }

  return { toastMessage, fields };
}
