import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import type {
  ReferralFormField,
  ReferralFormFieldMessages,
} from '@/lib/doctor/referrals/referralFormSchema';
import { getReferralFormMessages } from '@/lib/doctor/referrals/referralFormSchema';
import { REFERRAL_API_URGENCY_VALUES } from '@/lib/doctor/referrals/referralPriority';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

type ReferralValidationErrorRecord = {
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

function asReferralValidationErrorRecord(
  value: unknown,
): ReferralValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ReferralValidationErrorRecord)
    : null;
}

function collectStructuredFieldTexts(
  body: ReferralValidationErrorRecord,
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
      const row = asReferralValidationErrorRecord(item);
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
          value
            .filter((entry) => typeof entry === 'string')
            .join(getCurrentLocale() === 'ar' ? '، ' : ', '),
        );
      }
    }
  }

  return out;
}

function mapLeafToReferralField(leaf: string): ReferralFormField | null {
  const n = leaf.toLowerCase();
  if (n.includes('specialty') || n.includes('special')) return 'specialty';
  if (n.includes('reason') || n.includes('clinicalreason')) return 'reason';
  if (n.includes('referraltype') || n === 'type') return 'referralType';
  if (n.includes('referreddoctor') || n.includes('doctorname')) {
    return 'referredDoctorName';
  }
  if (n.includes('institution') || n.includes('hospital')) return 'institution';
  if (n.includes('clinicalsummary') || n.includes('summary')) {
    return 'clinicalSummary';
  }
  if (n.includes('question')) return 'questionsToColleague';
  if (n.includes('note')) return 'notes';
  if (n.includes('urgency') || n.includes('priority')) return 'priority';
  return null;
}

function messageTargetsReferralRequired(text: string): boolean {
  return (
    /specialty/i.test(text) ||
    /reason/i.test(text) ||
    /اختصاص/.test(text) ||
    /سبب/.test(text) ||
    /referral/i.test(text) ||
    /تحويل/.test(text)
  );
}

export function resolveReferralServerFeedback(
  error: unknown,
  t: TFn = defaultT,
): {
  toastMessage: string;
  fields: ReferralFormFieldMessages;
} {
  const locale = getCurrentLocale();
  const toastMessage = getUserFacingRequestErrorMessage(error, locale);
  const messages = getReferralFormMessages(t);
  const priorityNotAccepted = t('doctor.referralFormErrors.priorityNotAccepted').replace(
    '{values}',
    REFERRAL_API_URGENCY_VALUES.join(locale === 'en' ? ', ' : '، '),
  );
  const fields: ReferralFormFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    if (leaf === '_root') continue;
    const target = mapLeafToReferralField(leaf);
    if (target && !fields[target]) fields[target] = msg;
  }

  if (
    messageKey.includes('validation.required') ||
    messageKey.includes('finalizerequiresreferral')
  ) {
    if (/specialty|اختصاص/i.test(combined) && !fields.specialty) {
      fields.specialty = messages.specialtyRequired;
    }
    if (/reason|سبب/i.test(combined) && !fields.reason) {
      fields.reason = messages.reasonRequired;
    }
    if (!fields.specialty && !fields.reason && messageTargetsReferralRequired(combined)) {
      fields.specialty = messages.specialtyRequired;
      fields.reason = messages.reasonRequired;
    }
  }

  if (messageKey.includes('invalidenum') && !fields.priority) {
    if (
      /urgency|priority|أهمية|استعجال/i.test(combined) ||
      Object.keys(fields).length === 0
    ) {
      fields.priority = priorityNotAccepted;
    }
  }

  if (
    error.status === 422 &&
    !fields.priority &&
    /قيمة غير صالحة/i.test(toastMessage) &&
    /urgency|priority/i.test(combined)
  ) {
    fields.priority = priorityNotAccepted;
  }

  return { toastMessage, fields };
}
