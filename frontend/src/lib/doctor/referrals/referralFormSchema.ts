import { z } from 'zod';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

export type ReferralPriority = 'normal' | 'urgent' | 'emergency';

export type ReferralFormState = {
  referralType: string;
  specialty: string;
  reason: string;
  referredDoctorName: string;
  institution: string;
  clinicalSummary: string;
  questionsToColleague: string;
  notes: string;
  priority: ReferralPriority;
};

/** رسائل التحقق — متوافقة مع POST/PATCH .../orders/referrals (API-3) */
export function getReferralFormMessages(t: TFn = defaultT) {
  return {
    specialtyRequired: t('doctor.referralFormSchema.specialtyRequired'),
    specialtyMin: t('doctor.referralFormSchema.specialtyMin'),
    specialtyMax: t('doctor.referralFormSchema.specialtyMax'),
    reasonRequired: t('doctor.referralFormSchema.reasonRequired'),
    reasonMin: t('doctor.referralFormSchema.reasonMin'),
    reasonMax: t('doctor.referralFormSchema.reasonMax'),
    referralTypeMax: t('doctor.referralFormSchema.referralTypeMax'),
    referredDoctorNameMax: t('doctor.referralFormSchema.referredDoctorNameMax'),
    institutionMax: t('doctor.referralFormSchema.institutionMax'),
    clinicalSummaryMax: t('doctor.referralFormSchema.clinicalSummaryMax'),
    questionsMax: t('doctor.referralFormSchema.questionsMax'),
    notesMax: t('doctor.referralFormSchema.notesMax'),
    priorityInvalid: t('doctor.referralFormSchema.priorityInvalid'),
    formSummary: t('doctor.referralFormSchema.formSummary'),
  } as const;
}

/** @deprecated Arabic-only — use getReferralFormMessages(t) for locale-aware messages. */
export const REFERRAL_FORM_MESSAGES = getReferralFormMessages((key) =>
  getTranslationValue('ar', key) ?? key,
);

export type ReferralFormField = keyof ReferralFormState;

export type ReferralFormFieldMessages = Partial<
  Record<ReferralFormField, string>
>;

function buildReferralFormObjectSchema(messages: ReturnType<typeof getReferralFormMessages>) {
  const prioritySchema = z.enum(['normal', 'urgent', 'emergency'], {
    message: messages.priorityInvalid,
  });

  return z.object({
    referralType: z
      .string()
      .trim()
      .max(80, messages.referralTypeMax),
    specialty: z
      .string()
      .trim()
      .max(120, messages.specialtyMax),
    reason: z.string().trim().max(2000, messages.reasonMax),
    referredDoctorName: z
      .string()
      .trim()
      .max(120, messages.referredDoctorNameMax),
    institution: z
      .string()
      .trim()
      .max(200, messages.institutionMax),
    clinicalSummary: z
      .string()
      .trim()
      .max(5000, messages.clinicalSummaryMax),
    questionsToColleague: z
      .string()
      .trim()
      .max(2000, messages.questionsMax),
    notes: z.string().trim().max(2000, messages.notesMax),
    priority: prioritySchema,
  });
}

/** مسودة: الحقول الاختيارية، مع حدود الطول؛ إن وُجد نص قصير جداً يُرفض */
export function buildReferralDraftFormSchema(t: TFn = defaultT) {
  const messages = getReferralFormMessages(t);
  return buildReferralFormObjectSchema(messages).superRefine((data, ctx) => {
    if (data.specialty.length > 0 && data.specialty.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['specialty'],
        message: messages.specialtyMin,
      });
    }
    if (data.reason.length > 0 && data.reason.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: messages.reasonMin,
      });
    }
  });
}

/** اعتماد/إرسال: specialty و reason مطلوبان (مثل الباك إند) */
export function buildReferralFinalizeFormSchema(t: TFn = defaultT) {
  const messages = getReferralFormMessages(t);
  return buildReferralFormObjectSchema(messages).extend({
    specialty: z
      .string()
      .trim()
      .min(1, messages.specialtyRequired)
      .min(2, messages.specialtyMin)
      .max(120, messages.specialtyMax),
    reason: z
      .string()
      .trim()
      .min(1, messages.reasonRequired)
      .min(3, messages.reasonMin)
      .max(2000, messages.reasonMax),
  });
}

export class ReferralFormSubmitError extends Error {
  readonly fields: ReferralFormFieldMessages;

  constructor(fields: ReferralFormFieldMessages, message: string) {
    super(message);
    this.name = 'ReferralFormSubmitError';
    this.fields = fields;
  }
}

function isReferralFormField(key: string): key is ReferralFormField {
  return (
    key === 'referralType' ||
    key === 'specialty' ||
    key === 'reason' ||
    key === 'referredDoctorName' ||
    key === 'institution' ||
    key === 'clinicalSummary' ||
    key === 'questionsToColleague' ||
    key === 'notes' ||
    key === 'priority'
  );
}

export function zodIssuesToReferralFieldMessages(
  error: z.ZodError,
): ReferralFormFieldMessages {
  const fields: ReferralFormFieldMessages = {};
  for (const issue of error.issues) {
    const raw = issue.path[0];
    if (typeof raw !== 'string' || !isReferralFormField(raw)) continue;
    if (!fields[raw]) fields[raw] = issue.message;
  }
  return fields;
}

function firstZodMessage(error: z.ZodError, messages: ReturnType<typeof getReferralFormMessages>): string {
  return error.issues[0]?.message ?? messages.formSummary;
}

export function assertReferralFormValid(
  form: ReferralFormState,
  mode: 'save' | 'finalize',
  t: TFn = defaultT,
): ReferralFormState {
  const schema =
    mode === 'finalize' ? buildReferralFinalizeFormSchema(t) : buildReferralDraftFormSchema(t);
  const result = schema.safeParse(form);
  if (result.success) return result.data;

  const fields = zodIssuesToReferralFieldMessages(result.error);
  const messages = getReferralFormMessages(t);
  throw new ReferralFormSubmitError(fields, firstZodMessage(result.error, messages));
}
