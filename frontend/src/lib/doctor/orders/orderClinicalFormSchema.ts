import { z } from 'zod';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import { mapClinicalUrgencyTextToApi } from '@/lib/doctor/referrals/referralPriority';
import { REFERRAL_API_URGENCY_VALUES } from '@/lib/doctor/referrals/referralPriority';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string, params?: Record<string, unknown>) => string;

function defaultT(key: string, params?: Record<string, unknown>): string {
  const locale = getCurrentLocale();
  const raw = getTranslationValue(locale, key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] != null ? String(params[name]) : m,
  );
}

export function getOrderClinicalMessages(t: TFn = defaultT) {
  return {
    clinicalReasonRequired: t('doctor.orderClinicalSchema.clinicalReasonRequired'),
    clinicalReasonRequiredSave: t('doctor.orderClinicalSchema.clinicalReasonRequiredSave'),
    clinicalReasonRequiredFinalize: t('doctor.orderClinicalSchema.clinicalReasonRequiredFinalize'),
    clinicalReasonMin: t('doctor.orderClinicalSchema.clinicalReasonMin'),
    clinicalReasonMax: t('doctor.orderClinicalSchema.clinicalReasonMax'),
    instructionsMax: t('doctor.orderClinicalSchema.instructionsMax'),
    centerInstructionsMax: t('doctor.orderClinicalSchema.centerInstructionsMax'),
    urgencyInvalid: t('doctor.orderClinicalSchema.urgencyInvalid', {
      values: REFERRAL_API_URGENCY_VALUES.join(
        getCurrentLocale() === 'en' ? ', ' : '، ',
      ),
    }),
    itemsRequired: t('doctor.orderClinicalSchema.itemsRequired'),
    formSummary: t('doctor.orderClinicalSchema.formSummary'),
    notesRequired: t('doctor.orderClinicalSchema.notesRequired'),
  } as const;
}

/** @deprecated Arabic-only — use getOrderClinicalMessages(t) for locale-aware messages. */
export const ORDER_CLINICAL_MESSAGES = getOrderClinicalMessages((key) => {
  const raw = getTranslationValue('ar', key);
  return raw ?? key;
});

export type OrderClinicalField = keyof RadiologyClinicalForm;

export type OrderClinicalFieldMessages = Partial<
  Record<OrderClinicalField, string>
>;

function buildBaseClinicalSchema(messages: ReturnType<typeof getOrderClinicalMessages>) {
  return z.object({
    urgency: z.string().trim().max(80),
    clinicalReason: z.string().trim().max(2000, messages.clinicalReasonMax),
    instructionsToPatient: z
      .string()
      .trim()
      .max(2000, messages.instructionsMax),
    imagingCenterInstructions: z
      .string()
      .trim()
      .max(2000, messages.centerInstructionsMax),
  });
}

function buildRefineUrgency(messages: ReturnType<typeof getOrderClinicalMessages>) {
  return function refineUrgency(data: RadiologyClinicalForm, ctx: z.RefinementCtx) {
    const raw = data.urgency.trim();
    if (!raw) return;
    if (mapClinicalUrgencyTextToApi(raw)) return;
    ctx.addIssue({
      code: 'custom',
      path: ['urgency'],
      message: messages.urgencyInvalid,
    });
  };
}

function buildClinicalReasonRequiredField(
  emptyMessage: string,
  messages: ReturnType<typeof getOrderClinicalMessages>,
) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .min(3, messages.clinicalReasonMin)
    .max(2000, messages.clinicalReasonMax);
}

/** مسودة التحاليل/الأشعة: السبب الطبي مطلوب (مثل التحويل — لا حفظ فارغ) */
export function buildOrderClinicalDraftSchema(t: TFn = defaultT) {
  const messages = getOrderClinicalMessages(t);
  const refineUrgency = buildRefineUrgency(messages);
  return buildBaseClinicalSchema(messages)
    .extend({
      clinicalReason: buildClinicalReasonRequiredField(
        messages.clinicalReasonRequiredSave,
        messages,
      ),
    })
    .superRefine((data, ctx) => {
      refineUrgency(data, ctx);
    });
}

export function buildOrderClinicalFinalizeSchema(t: TFn = defaultT) {
  const messages = getOrderClinicalMessages(t);
  const refineUrgency = buildRefineUrgency(messages);
  return buildBaseClinicalSchema(messages)
    .extend({
      clinicalReason: buildClinicalReasonRequiredField(
        messages.clinicalReasonRequiredFinalize,
        messages,
      ),
    })
    .superRefine((data, ctx) => {
      refineUrgency(data, ctx);
    });
}

/** إجراءات: حقول مختصرة — التحقق على الملاحظات فقط */
export function buildOrderClinicalCompactDraftSchema(t: TFn = defaultT) {
  const messages = getOrderClinicalMessages(t);
  const refineUrgency = buildRefineUrgency(messages);
  return z
    .object({
      urgency: z.string().trim().max(80),
      instructionsToPatient: z
        .string()
        .trim()
        .max(2000, messages.instructionsMax),
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
}

export function buildOrderClinicalCompactFinalizeSchema(t: TFn = defaultT) {
  const messages = getOrderClinicalMessages(t);
  const refineUrgency = buildRefineUrgency(messages);
  return z
    .object({
      urgency: z.string().trim().max(80),
      instructionsToPatient: z
        .string()
        .trim()
        .min(1, messages.notesRequired)
        .max(2000, messages.instructionsMax),
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
}

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

function pickSchema(variant: 'full' | 'compact', mode: 'save' | 'finalize', t: TFn) {
  if (variant === 'compact') {
    return mode === 'finalize'
      ? buildOrderClinicalCompactFinalizeSchema(t)
      : buildOrderClinicalCompactDraftSchema(t);
  }
  return mode === 'finalize' ? buildOrderClinicalFinalizeSchema(t) : buildOrderClinicalDraftSchema(t);
}

export function assertOrderClinicalFormValid(
  form: RadiologyClinicalForm,
  mode: 'save' | 'finalize',
  variant: 'full' | 'compact' = 'full',
  t: TFn = defaultT,
): RadiologyClinicalForm {
  const schema = pickSchema(variant, mode, t);
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
  const messages = getOrderClinicalMessages(t);
  const message =
    result.error.issues[0]?.message ?? messages.formSummary;
  throw new OrderClinicalFormSubmitError(fields, message);
}
