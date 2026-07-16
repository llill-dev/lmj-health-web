import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { localizeOrderStatusesInMessage } from '@/lib/doctor/orders/orderStatusLabels';
import type { EncounterOrderCategoryKey } from '@/lib/doctor/encounters/encounterOrderCategories';
import { mapClinicalUrgencyTextToApi } from '@/lib/doctor/referrals/referralPriority';
import type {
  CreateEncounterOrderBody,
  EncounterOrderResponse,
  ImagingOrderItemBody,
  UpdateEncounterOrderBody,
} from '@/lib/doctor/encounters/encounterOrderTypes';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { RadiologyOrderItemUi } from '@/components/doctor/radiology/radiology-types';

function asEncounterOrderCreateRecord(
  value: unknown,
): { _id?: unknown; id?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

export function resolveEncounterOrderIdFromCreateResponse(
  response: EncounterOrderResponse,
): string {
  const order = asEncounterOrderCreateRecord(response.order);
  const root = asEncounterOrderCreateRecord(response);
  const id =
    (typeof order?._id === 'string' ? order._id.trim() : undefined) ??
    (typeof order?.id === 'string' ? order.id.trim() : undefined) ??
    response.orderId?.trim() ??
    (typeof root?._id === 'string' ? root._id.trim() : undefined);
  if (!id || id === 'undefined') throw new Error('missing_order');
  return id;
}

function catalogItemsBody(
  patientId: string,
  catalogItemId: string,
): CreateEncounterOrderBody {
  const id = catalogItemId.trim();
  return {
    patientId,
    catalogItems: [{ catalogItemId: id }],
  };
}

function draftPlaceholderItem(
  category: EncounterOrderCategoryKey,
): ImagingOrderItemBody {
  switch (category) {
    case 'lab':
      return {
        title: 'مسودة تحليل',
        name: 'مسودة تحليل',
        displayName: 'مسودة تحليل',
        testName: 'مسودة تحليل',
      };
    case 'radiology':
      return {
        title: 'مسودة أشعة',
        name: 'مسودة أشعة',
        displayName: 'مسودة أشعة',
      };
    case 'procedure':
      return {
        title: 'مسودة إجراء',
        name: 'مسودة إجراء',
        displayName: 'مسودة إجراء',
        procedureName: 'مسودة إجراء',
      };
    default:
      return { title: 'مسودة', name: 'مسودة' };
  }
}

/** بند يدوي بسيط لإنشاء مسودة عندما لا يتوفر عنصر كتالوج صالح */
export function draftManualPlaceholderBody(
  category: EncounterOrderCategoryKey,
  patientId: string,
): CreateEncounterOrderBody {
  const pid = patientId.trim();
  const item = draftPlaceholderItem(category);
  return {
    patientId: pid,
    manualItems: [item],
    items: [item],
  };
}

/**
 * مرشحات POST /doctors/orders/lab|imaging|procedures — بدون encounterId في الجسم
 * (الربط بالزيارة يكون عبر مسار الزيارة فقط).
 */
export function buildStandaloneOrderCreateCandidates(
  category: EncounterOrderCategoryKey,
  patientId: string,
  catalogItemId?: string,
): CreateEncounterOrderBody[] {
  const pid = patientId.trim();
  if (!pid || category === 'referral') return [];

  const seen = new Set<string>();
  const candidates: CreateEncounterOrderBody[] = [];
  const push = (body: CreateEncounterOrderBody) => {
    const key = JSON.stringify(body);
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(body);
  };

  if (catalogItemId?.trim()) {
    push(catalogItemsBody(pid, catalogItemId.trim()));
  }

  push(draftManualPlaceholderBody(category, pid));

  const item = draftPlaceholderItem(category);
  push({ patientId: pid, items: [item] });
  push({ patientId: pid, manualItems: [item] });

  return candidates;
}

/**
 * مرشحات إنشاء طلب الزيارة — متوافقة مع API-3:
 * - patientId مطلوب في الجسم (حتى مع وجوده في المسار)
 * - يلزم بند واحد على الأقل (catalogItems | manualItems | items)
 * - لا نرسل type/category/orderType/encounterId على مسارات .../orders/lab|imaging
 */
export function buildEncounterOrderCreateCandidates(
  category: EncounterOrderCategoryKey,
  patientId: string,
  encounterId?: string,
  catalogItemId?: string,
): CreateEncounterOrderBody[] {
  const pid = patientId.trim();
  if (!pid) return [{}];

  const eid = encounterId?.trim();
  const seen = new Set<string>();
  const candidates: CreateEncounterOrderBody[] = [];
  const push = (body: CreateEncounterOrderBody) => {
    const key = JSON.stringify(body);
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(body);
  };

  if (catalogItemId?.trim()) {
    push(catalogItemsBody(pid, catalogItemId.trim()));
  }

  push(draftManualPlaceholderBody(category, pid));

  const item = draftPlaceholderItem(category);
  push({ patientId: pid, items: [item] });
  push({ patientId: pid, manualItems: [item] });

  if (category === 'referral') {
    return [
      {
        patientId: pid,
        specialty: 'اختصاص عام',
        reason: 'تحويل من الزيارة الطبية',
        ...(eid ? { encounterId: eid } : {}),
      },
      {
        specialty: 'اختصاص عام',
        reason: 'تحويل من الزيارة الطبية',
      },
    ];
  }

  return candidates;
}

/** أول مرشح لإنشاء مسودة — للاستدعاءات التي تمرّر جسمًا واحدًا فقط */
export function buildEncounterOrderCreateBody(
  category: EncounterOrderCategoryKey,
  patientId: string,
  encounterId?: string,
  catalogItemId?: string,
): CreateEncounterOrderBody {
  return (
    buildEncounterOrderCreateCandidates(
      category,
      patientId,
      encounterId,
      catalogItemId,
    )[0] ?? draftManualPlaceholderBody(category, patientId)
  );
}

function asValidationErrorRow(
  value: unknown,
): { path?: unknown; msg?: unknown; value?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function formatValidationErrors(error: ApiError): string | null {
  const errors = error.body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const hint = errors
    .map((entry) => {
      const row = asValidationErrorRow(entry);
      const path = typeof row?.path === 'string' ? row.path.trim() : undefined;
      const msg = typeof row?.msg === 'string' ? row.msg.trim() : undefined;
      if (path === 'patientId') {
        return 'معرّف المريض (patientId) مطلوب أو غير صالح';
      }
      if (path === 'encounterId') {
        return 'معرّف الزيارة (encounterId) غير مقبول في جسم الطلب';
      }
      if (path === 'orderType' || path === 'type' || path === 'category') {
        return `حقل النوع (${path}) غير مقبول هنا`;
      }
      if (
        path === 'catalogItems' ||
        path === 'manualItems' ||
        path === 'items'
      ) {
        return 'يلزم بند تحليل/فحص واحد على الأقل (من الكتالوج أو يدوياً)';
      }
      if (path && msg) return `${path}: ${msg}`;
      if (path) return path;
      return msg;
    })
    .filter(Boolean)
    .join('؛ ');

  return hint || null;
}

/** رسالة عربية أوضح عند فشل إنشاء/تحميل طلب الزيارة (خصوصاً 422). */
export function getEncounterOrderRequestErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message === 'errors.orders.finalizeRequiresItems'
  ) {
    return 'يجب إضافة بند واحد على الأقل قبل الاعتماد النهائي.';
  }

  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }

  if (error.status === 422 || error.status === 400) {
    const validationHint = formatValidationErrors(error);
    if (validationHint) {
      return `تعذّر إنشاء الطلب: ${validationHint}.`;
    }
  }

  return localizeOrderStatusesInMessage(error.message);
}

export function isEncounterOrderCreateValidationError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 400 || error.status === 422;
}

export function mapClinicalFormToOrderPatch(
  category: EncounterOrderCategoryKey,
  clinical: RadiologyClinicalForm,
): UpdateEncounterOrderBody {
  const urgency = mapClinicalUrgencyTextToApi(clinical.urgency);

  if (category === 'lab') {
    const labParts = [
      clinical.requiresFasting ? 'يتطلب الصيام' : '',
      clinical.imagingCenterInstructions.trim(),
    ].filter(Boolean);
    return {
      urgency,
      clinicalReason: clinical.clinicalReason.trim() || undefined,
      instructionsToPatient: clinical.instructionsToPatient.trim() || undefined,
      labInstructions: labParts.length ? labParts.join(' — ') : undefined,
    };
  }

  if (category === 'procedure') {
    return {
      urgency,
      instructionsToPatient: clinical.instructionsToPatient.trim() || undefined,
      notes: clinical.instructionsToPatient.trim() || undefined,
    };
  }

  return {
    urgency,
    clinicalReason: clinical.clinicalReason.trim() || undefined,
    instructionsToPatient: clinical.instructionsToPatient.trim() || undefined,
    imagingCenterInstructions:
      clinical.imagingCenterInstructions.trim() || undefined,
  };
}

export function mapUiItemToOrderItemBody(
  category: EncounterOrderCategoryKey,
  item: Omit<RadiologyOrderItemUi, 'id'>,
): ImagingOrderItemBody {
  const title = item.name.trim();
  const base: ImagingOrderItemBody = {
    title,
    name: title,
    testName: title,
    procedureName: category === 'procedure' ? title : undefined,
    catalogItemId: item.catalogItemId,
  };

  if (category === 'radiology') {
    const bodyArea = item.bodyArea?.trim();
    const modality = item.type?.trim();
    return {
      ...base,
      notes: JSON.stringify({
        category: item.category?.trim() || undefined,
        type: modality || undefined,
        bodyArea: bodyArea || undefined,
        side: item.side?.trim() || undefined,
        position: item.position?.trim() || undefined,
        notes: item.notes?.trim() || undefined,
      }),
      details: {
        type: modality || undefined,
        bodyArea: bodyArea || undefined,
        side: item.side?.trim() || undefined,
        position: item.position?.trim() || undefined,
        category: item.category?.trim() || undefined,
      },
    };
  }

  const plainNotes = item.notes?.trim();
  return {
    ...base,
    notes: plainNotes && plainNotes !== '—' ? plainNotes : undefined,
  };
}
