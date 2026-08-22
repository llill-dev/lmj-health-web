import { z } from 'zod';

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
export const REFERRAL_FORM_MESSAGES = {
  specialtyRequired: 'التخصص مطلوب قبل اعتماد التحويل.',
  specialtyMin: 'التخصص قصير جداً (حرفان على الأقل).',
  specialtyMax: 'التخصص طويل جداً (120 حرفاً كحد أقصى).',
  reasonRequired: 'سبب التحويل مطلوب قبل الاعتماد.',
  reasonMin: 'سبب التحويل قصير جداً (3 أحرف على الأقل).',
  reasonMax: 'سبب التحويل طويل جداً (2000 حرفاً كحد أقصى).',
  referralTypeMax: 'نوع التحويل طويل جداً (80 حرفاً كحد أقصى).',
  referredDoctorNameMax: 'اسم الطبيب طويل جداً (120 حرفاً كحد أقصى).',
  institutionMax: 'اسم المؤسسة طويل جداً (200 حرفاً كحد أقصى).',
  clinicalSummaryMax: 'تفاصيل الحالة طويلة جداً (5000 حرفاً كحد أقصى).',
  questionsMax: 'الأسئلة طويلة جداً (2000 حرفاً كحد أقصى).',
  notesMax: 'الملاحظات طويلة جداً (2000 حرفاً كحد أقصى).',
  priorityInvalid: 'درجة الأهمية غير صالحة.',
  formSummary: 'يرجى تصحيح الحقول المميزة قبل المتابعة.',
} as const;

export type ReferralFormField = keyof ReferralFormState;

export type ReferralFormFieldMessages = Partial<
  Record<ReferralFormField, string>
>;

const prioritySchema = z.enum(['normal', 'urgent', 'emergency'], {
  message: REFERRAL_FORM_MESSAGES.priorityInvalid,
});

const referralFormObjectSchema = z.object({
  referralType: z
    .string()
    .trim()
    .max(80, REFERRAL_FORM_MESSAGES.referralTypeMax),
  specialty: z
    .string()
    .trim()
    .max(120, REFERRAL_FORM_MESSAGES.specialtyMax),
  reason: z.string().trim().max(2000, REFERRAL_FORM_MESSAGES.reasonMax),
  referredDoctorName: z
    .string()
    .trim()
    .max(120, REFERRAL_FORM_MESSAGES.referredDoctorNameMax),
  institution: z
    .string()
    .trim()
    .max(200, REFERRAL_FORM_MESSAGES.institutionMax),
  clinicalSummary: z
    .string()
    .trim()
    .max(5000, REFERRAL_FORM_MESSAGES.clinicalSummaryMax),
  questionsToColleague: z
    .string()
    .trim()
    .max(2000, REFERRAL_FORM_MESSAGES.questionsMax),
  notes: z.string().trim().max(2000, REFERRAL_FORM_MESSAGES.notesMax),
  priority: prioritySchema,
});

/** مسودة: الحقول الاختيارية، مع حدود الطول؛ إن وُجد نص قصير جداً يُرفض */
export const referralDraftFormSchema = referralFormObjectSchema.superRefine(
  (data, ctx) => {
    if (data.specialty.length > 0 && data.specialty.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['specialty'],
        message: REFERRAL_FORM_MESSAGES.specialtyMin,
      });
    }
    if (data.reason.length > 0 && data.reason.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: REFERRAL_FORM_MESSAGES.reasonMin,
      });
    }
  },
);

/** اعتماد/إرسال: specialty و reason مطلوبان (مثل الباك إند) */
export const referralFinalizeFormSchema = referralFormObjectSchema
  .extend({
    specialty: z
      .string()
      .trim()
      .min(1, REFERRAL_FORM_MESSAGES.specialtyRequired)
      .min(2, REFERRAL_FORM_MESSAGES.specialtyMin)
      .max(120, REFERRAL_FORM_MESSAGES.specialtyMax),
    reason: z
      .string()
      .trim()
      .min(1, REFERRAL_FORM_MESSAGES.reasonRequired)
      .min(3, REFERRAL_FORM_MESSAGES.reasonMin)
      .max(2000, REFERRAL_FORM_MESSAGES.reasonMax),
  });

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

function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? REFERRAL_FORM_MESSAGES.formSummary;
}

export function assertReferralFormValid(
  form: ReferralFormState,
  mode: 'save' | 'finalize',
): ReferralFormState {
  const schema =
    mode === 'finalize' ? referralFinalizeFormSchema : referralDraftFormSchema;
  const result = schema.safeParse(form);
  if (result.success) return result.data;

  const fields = zodIssuesToReferralFieldMessages(result.error);
  throw new ReferralFormSubmitError(fields, firstZodMessage(result.error));
}
