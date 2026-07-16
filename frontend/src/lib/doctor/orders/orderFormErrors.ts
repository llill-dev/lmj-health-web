import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import type { OrderClinicalFieldMessages } from '@/lib/doctor/orders/orderClinicalFormSchema';
import { ORDER_CLINICAL_MESSAGES } from '@/lib/doctor/orders/orderClinicalFormSchema';
import type { OrderManualFieldMessages } from '@/lib/doctor/orders/orderManualFormSchema';
import { REFERRAL_API_URGENCY_VALUES } from '@/lib/doctor/referrals/referralPriority';

type DoctorOrderValidationErrorRecord = {
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

function asDoctorOrderValidationErrorRecord(
  value: unknown,
): DoctorOrderValidationErrorRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function collectStructuredFieldTexts(
  body: DoctorOrderValidationErrorRecord,
): Map<string, string> {
  const out = new Map<string, string>();
  const errs = body.errors;
  if (errs == null) return out;

  if (typeof errs === 'string') {
    out.set('_root', errs);
    return out;
  }

  if (Array.isArray(errs)) {
    for (const item of errs) {
      if (typeof item === 'string') continue;
      const row = asDoctorOrderValidationErrorRecord(item);
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
      if (leaf && msg) out.set(leaf, msg);
    }
  }

  return out;
}

function mapLeafToClinicalField(leaf: string): keyof OrderClinicalFieldMessages | null {
  const n = leaf.toLowerCase();
  if (n.includes('clinicalreason') || n === 'reason') return 'clinicalReason';
  if (n.includes('instructionstopatient') || n.includes('instructions')) {
    return 'instructionsToPatient';
  }
  if (n.includes('labinstruction') || n.includes('imagingcenter')) {
    return 'imagingCenterInstructions';
  }
  if (n.includes('urgency') || n.includes('priority')) return 'urgency';
  return null;
}

export function resolveOrderClinicalServerFeedback(error: unknown): {
  toastMessage: string;
  fields: OrderClinicalFieldMessages;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
  const fields: OrderClinicalFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  const messageKey = (error.messageKey ?? '').toLowerCase();
  const combined = `${messageKey} ${toastMessage}`.toLowerCase();

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    const target = mapLeafToClinicalField(leaf);
    if (target && !fields[target]) fields[target] = msg;
  }

  if (messageKey.includes('finalizerequiresitems')) {
    return {
      toastMessage: ORDER_CLINICAL_MESSAGES.itemsRequired,
      fields,
    };
  }

  if (messageKey.includes('invalidenum') && !fields.urgency) {
    if (/urgency|priority|استعجال/i.test(combined)) {
      fields.urgency = `درجة الاستعجال غير مقبولة. القيم المسموحة: ${REFERRAL_API_URGENCY_VALUES.join('، ')}.`;
    }
  }

  return { toastMessage, fields };
}

export function resolveOrderManualServerFeedback(error: unknown): {
  toastMessage: string;
  fields: OrderManualFieldMessages;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
  const fields: OrderManualFieldMessages = {};

  if (!(error instanceof ApiError)) {
    return { toastMessage, fields };
  }

  for (const [leaf, msg] of collectStructuredFieldTexts(error.body)) {
    const n = leaf.toLowerCase();
    if (n.includes('title') || n.includes('name') || n.includes('test')) {
      if (!fields.name) fields.name = msg;
    }
  }

  return { toastMessage, fields };
}
