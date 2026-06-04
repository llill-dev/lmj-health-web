import { z } from 'zod';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import { mapClinicalUrgencyTextToApi } from './referralPriority';
import { REFERRAL_API_URGENCY_VALUES } from './referralPriority';

export const ORDER_CLINICAL_MESSAGES = {
  clinicalReasonRequired: 'السبب الطبي مطلوب.',
  clinicalReasonRequiredSave: 'السبب الطبي مطلوب قبل حفظ المسودة.',
  clinicalReasonRequiredFinalize: 'السبب الطبي مطلوب قبل الاعتماد النهائي.',
  clinicalReasonMin: 'السبب الطبي قصير جداً (3 أحرف على الأقل).',
  clinicalReasonMax: 'السبب الطبي طويل جداً (2000 حرفاً كحد أقصى).',
  instructionsMax: 'تعليمات المريض طويلة جداً (2000 حرفاً كحد أقصى).',
  centerInstructionsMax: 'تعليمات المختبر/المركز طويلة جداً (2000 حرفاً كحد أقصى).',
  urgencyInvalid: `درجة الاستعجال غير صالحة. استخدم: عادي، عاجل، طارئ — أو ${REFERRAL_API_URGENCY_VALUES.join('، ')}.`,
  itemsRequired: 'أضف تحليلاً أو فحصاً واحداً على الأقل قبل الاعتماد.',
  formSummary: 'يرجى تصحيح الحقول المميزة قبل المتابعة.',
} as const;

export type OrderClinicalField = keyof RadiologyClinicalForm;

export type OrderClinicalFieldMessages = Partial<
  Record<OrderClinicalField, string>
>;

const baseClinicalSchema = z.object({
  urgency: z.string().trim().max(80),
  clinicalReason: z.string().trim().max(2000, ORDER_CLINICAL_MESSAGES.clinicalReasonMax),
  instructionsToPatient: z
    .string()
    .trim()
    .max(2000, ORDER_CLINICAL_MESSAGES.instructionsMax),
  imagingCenterInstructions: z
    .string()
    .trim()
    .max(2000, ORDER_CLINICAL_MESSAGES.centerInstructionsMax),
});

function refineUrgency(data: RadiologyClinicalForm, ctx: z.RefinementCtx) {
  const raw = data.urgency.trim();
  if (!raw) return;
  if (mapClinicalUrgencyTextToApi(raw)) return;
  ctx.addIssue({
    code: 'custom',
    path: ['urgency'],
    message: ORDER_CLINICAL_MESSAGES.urgencyInvalid,
  });
}

const clinicalReasonRequiredField = (emptyMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .min(3, ORDER_CLINICAL_MESSAGES.clinicalReasonMin)
    .max(2000, ORDER_CLINICAL_MESSAGES.clinicalReasonMax);

/** مسودة التحاليل/الأشعة: السبب الطبي مطلوب (مثل التحويل — لا حفظ فارغ) */
export const orderClinicalDraftSchema = baseClinicalSchema
  .extend({
    clinicalReason: clinicalReasonRequiredField(
      ORDER_CLINICAL_MESSAGES.clinicalReasonRequiredSave,
    ),
  })
  .superRefine((data, ctx) => {
    refineUrgency(data, ctx);
  });

export const orderClinicalFinalizeSchema = baseClinicalSchema
  .extend({
    clinicalReason: clinicalReasonRequiredField(
      ORDER_CLINICAL_MESSAGES.clinicalReasonRequiredFinalize,
    ),
  })
  .superRefine((data, ctx) => {
    refineUrgency(data, ctx);
  });

/** إجراءات: حقول مختصرة — التحقق على الملاحظات فقط */
export const orderClinicalCompactDraftSchema = z
  .object({
    urgency: z.string().trim().max(80),
    instructionsToPatient: z
      .string()
      .trim()
      .max(2000, ORDER_CLINICAL_MESSAGES.instructionsMax),
  })
  .superRefine((data, ctx) => {
    refineUrgency(
      {
        urgency: data.urgency,
        clinicalReason: '',
        instructionsToPatient: data.instructionsToPatient,
        imagingCenterInstructions: '',
      },
      ctx,
    );
  });

export const orderClinicalCompactFinalizeSchema = z
  .object({
    urgency: z.string().trim().max(80),
    instructionsToPatient: z
      .string()
      .trim()
      .min(1, 'ملاحظات أو تعليمات للمريض مطلوبة قبل الاعتماد.')
      .max(2000, ORDER_CLINICAL_MESSAGES.instructionsMax),
  })
  .superRefine((data, ctx) => {
    refineUrgency(
      {
        urgency: data.urgency,
        clinicalReason: '',
        instructionsToPatient: data.instructionsToPatient,
        imagingCenterInstructions: '',
      },
      ctx,
    );
  });

export class OrderClinicalFormSubmitError extends Error {
  readonly fields: OrderClinicalFieldMessages;

  constructor(fields: OrderClinicalFieldMessages, message: string) {
    super(message);
    this.name = 'OrderClinicalFormSubmitError';
    this.fields = fields;
  }
}

export class OrderItemsRequiredError extends Error {
  constructor() {
    super('errors.orders.finalizeRequiresItems');
    this.name = 'OrderItemsRequiredError';
  }
}

function isClinicalField(key: string): key is OrderClinicalField {
  return (
    key === 'urgency' ||
    key === 'clinicalReason' ||
    key === 'instructionsToPatient' ||
    key === 'imagingCenterInstructions'
  );
}

export function zodIssuesToOrderClinicalFieldMessages(
  error: z.ZodError,
): OrderClinicalFieldMessages {
  const fields: OrderClinicalFieldMessages = {};
  for (const issue of error.issues) {
    const raw = issue.path[0];
    if (typeof raw !== 'string' || !isClinicalField(raw)) continue;
    if (!fields[raw]) fields[raw] = issue.message;
  }
  return fields;
}

function pickSchema(variant: 'full' | 'compact', mode: 'save' | 'finalize') {
  if (variant === 'compact') {
    return mode === 'finalize'
      ? orderClinicalCompactFinalizeSchema
      : orderClinicalCompactDraftSchema;
  }
  return mode === 'finalize' ? orderClinicalFinalizeSchema : orderClinicalDraftSchema;
}

export function assertOrderClinicalFormValid(
  form: RadiologyClinicalForm,
  mode: 'save' | 'finalize',
  variant: 'full' | 'compact' = 'full',
): RadiologyClinicalForm {
  const schema = pickSchema(variant, mode);
  const payload =
    variant === 'compact'
      ? {
          urgency: form.urgency,
          instructionsToPatient: form.instructionsToPatient,
        }
      : form;
  const result = schema.safeParse(payload);
  if (result.success) return form;

  const fields = zodIssuesToOrderClinicalFieldMessages(result.error);
  const message =
    result.error.issues[0]?.message ?? ORDER_CLINICAL_MESSAGES.formSummary;
  throw new OrderClinicalFormSubmitError(fields, message);
}
