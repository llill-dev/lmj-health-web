import { z } from 'zod';
import type { RadiologyManualForm } from '@/components/doctor/radiology/radiology-types';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

export function getOrderManualMessages(t: TFn = defaultT) {
  return {
    nameRequired: t('doctor.orderManualSchema.nameRequired'),
    nameMin: t('doctor.orderManualSchema.nameMin'),
    nameMax: t('doctor.orderManualSchema.nameMax'),
    typeMax: t('doctor.orderManualSchema.typeMax'),
    bodyAreaMax: t('doctor.orderManualSchema.bodyAreaMax'),
    sideMax: t('doctor.orderManualSchema.sideMax'),
    positionMax: t('doctor.orderManualSchema.positionMax'),
    notesMax: t('doctor.orderManualSchema.notesMax'),
    formSummary: t('doctor.orderManualSchema.formSummary'),
  } as const;
}

/** @deprecated Arabic-only — use getOrderManualMessages(t) for locale-aware messages. */
export const ORDER_MANUAL_MESSAGES = getOrderManualMessages((key) =>
  getTranslationValue('ar', key) ?? key,
);

export type OrderManualField = keyof RadiologyManualForm;

export type OrderManualFieldMessages = Partial<
  Record<OrderManualField, string>
>;

export function buildOrderManualItemSchema(t: TFn = defaultT) {
  const messages = getOrderManualMessages(t);
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(200, messages.nameMax),
    type: z.string().trim().max(80, messages.typeMax),
    bodyArea: z.string().trim().max(120, messages.bodyAreaMax),
    side: z.string().trim().max(40, messages.sideMax),
    position: z.string().trim().max(80, messages.positionMax),
    notes: z.string().trim().max(1000, messages.notesMax),
  });
}

/** @deprecated Arabic-only — use buildOrderManualItemSchema(t) for locale-aware messages. */
export const orderManualItemSchema = buildOrderManualItemSchema((key) =>
  getTranslationValue('ar', key) ?? key,
);

export class OrderManualFormSubmitError extends Error {
  readonly fields: OrderManualFieldMessages;

  constructor(fields: OrderManualFieldMessages, message: string) {
    super(message);
    this.name = 'OrderManualFormSubmitError';
    this.fields = fields;
  }
}

function isManualField(key: string): key is OrderManualField {
  return (
    key === 'name' ||
    key === 'type' ||
    key === 'bodyArea' ||
    key === 'side' ||
    key === 'position' ||
    key === 'notes'
  );
}

export function zodIssuesToOrderManualFieldMessages(
  error: z.ZodError,
): OrderManualFieldMessages {
  const fields: OrderManualFieldMessages = {};
  for (const issue of error.issues) {
    const raw = issue.path[0];
    if (typeof raw !== 'string' || !isManualField(raw)) continue;
    if (!fields[raw]) fields[raw] = issue.message;
  }
  return fields;
}

export function assertOrderManualFormValid(
  form: RadiologyManualForm,
  t: TFn = defaultT,
): RadiologyManualForm {
  const schema = buildOrderManualItemSchema(t);
  const result = schema.safeParse(form);
  if (result.success) return result.data;

  const fields = zodIssuesToOrderManualFieldMessages(result.error);
  const messages = getOrderManualMessages(t);
  const message =
    result.error.issues[0]?.message ?? messages.formSummary;
  throw new OrderManualFormSubmitError(fields, message);
}
