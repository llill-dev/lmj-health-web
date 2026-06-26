import { z } from 'zod';
import type { RadiologyManualForm } from '@/components/doctor/radiology/radiology-types';

export const ORDER_MANUAL_MESSAGES = {
  nameRequired: 'اسم التحليل أو الفحص مطلوب.',
  nameMin: 'الاسم قصير جداً (حرفان على الأقل).',
  nameMax: 'الاسم طويل جداً (200 حرفاً كحد أقصى).',
  typeMax: 'النوع طويل جداً (80 حرفاً كحد أقصى).',
  bodyAreaMax: 'منطقة الجسم طويلة جداً (120 حرفاً كحد أقصى).',
  sideMax: 'الجهة طويلة جداً (40 حرفاً كحد أقصى).',
  positionMax: 'الوضعية طويلة جداً (80 حرفاً كحد أقصى).',
  notesMax: 'الملاحظات طويلة جداً (1000 حرفاً كحد أقصى).',
  formSummary: 'يرجى تصحيح الحقول المميزة قبل الحفظ.',
} as const;

export type OrderManualField = keyof RadiologyManualForm;

export type OrderManualFieldMessages = Partial<
  Record<OrderManualField, string>
>;

export const orderManualItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ORDER_MANUAL_MESSAGES.nameRequired)
    .min(2, ORDER_MANUAL_MESSAGES.nameMin)
    .max(200, ORDER_MANUAL_MESSAGES.nameMax),
  type: z.string().trim().max(80, ORDER_MANUAL_MESSAGES.typeMax),
  bodyArea: z.string().trim().max(120, ORDER_MANUAL_MESSAGES.bodyAreaMax),
  side: z.string().trim().max(40, ORDER_MANUAL_MESSAGES.sideMax),
  position: z.string().trim().max(80, ORDER_MANUAL_MESSAGES.positionMax),
  notes: z.string().trim().max(1000, ORDER_MANUAL_MESSAGES.notesMax),
});

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
): RadiologyManualForm {
  const result = orderManualItemSchema.safeParse(form);
  if (result.success) return result.data;

  const fields = zodIssuesToOrderManualFieldMessages(result.error);
  const message =
    result.error.issues[0]?.message ?? ORDER_MANUAL_MESSAGES.formSummary;
  throw new OrderManualFormSubmitError(fields, message);
}
