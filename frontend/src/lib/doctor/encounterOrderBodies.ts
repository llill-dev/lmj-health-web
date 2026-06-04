import { ApiError, getUserFacingRequestErrorMessage } from '@/lib/api';
import { localizeOrderStatusesInMessage } from './orderStatusLabels';
import type { EncounterOrderCategoryKey } from './encounterOrderCategories';
import { mapClinicalUrgencyTextToApi } from './referralPriority';
import type {
  CreateEncounterOrderBody,
  EncounterOrderResponse,
  ImagingOrderItemBody,
  UpdateEncounterOrderBody,
} from './encounterOrderTypes';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { RadiologyOrderItemUi } from '@/components/doctor/radiology/radiology-types';

export function resolveEncounterOrderIdFromCreateResponse(
  response: EncounterOrderResponse,
): string {
  const order = response.order as { _id?: string; id?: string } | undefined;
  const id =
    order?._id?.trim() ??
    order?.id?.trim() ??
    response.orderId?.trim() ??
    (response as { _id?: string })._id?.trim();
  if (!id || id === 'undefined') throw new Error('missing_order');
  return id;
}

function legacyTypeForCategory(
  category: EncounterOrderCategoryKey,
): string | undefined {
  switch (category) {
    case 'lab':
      return 'lab';
    case 'radiology':
      return 'imaging';
    case 'procedure':
      return 'procedure';
    default:
      return undefined;
  }
}

function catalogItemsBody(
  patientId: string,
  catalogItemId: string,
  encounterId?: string,
): CreateEncounterOrderBody {
  const id = catalogItemId.trim();
  const body: CreateEncounterOrderBody = {
    patientId,
    catalogItems: [{ catalogItemId: id, _id: id }],
  };
  if (encounterId?.trim()) body.encounterId = encounterId.trim();
  return body;
}

/** بند يدوي بسيط لإنشاء مسودة عندما لا يتوفر عنصر كتالوج صالح */
export function draftManualPlaceholderBody(
  category: EncounterOrderCategoryKey,
  patientId: string,
  encounterId?: string,
): CreateEncounterOrderBody {
  const pid = patientId.trim();
  const body: CreateEncounterOrderBody = { patientId: pid };
  const eid = encounterId?.trim();
  if (eid) body.encounterId = eid;

  switch (category) {
    case 'lab':
      body.manualItems = [
        {
          title: 'مسودة تحليل',
          name: 'مسودة تحليل',
          testName: 'مسودة تحليل',
        },
      ];
      break;
    case 'radiology':
      body.manualItems = [
        {
          title: 'مسودة أشعة',
          name: 'مسودة أشعة',
        },
      ];
      break;
    case 'procedure':
      body.manualItems = [
        {
          title: 'مسودة إجراء',
          name: 'مسودة إجراء',
          procedureName: 'مسودة إجراء',
        },
      ];
      break;
    default:
      break;
  }

  return body;
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
  push({ patientId: pid });

  return candidates;
}

/**
 * مرشحات إنشاء طلب الزيارة — متوافقة مع API-4:
 * - patientId مطلوب في الجسم (حتى مع وجوده في المسار)
 * - لا نرسل orderType على مسارات .../orders/lab|imaging (النوع من الـ URL)
 * - encounterId في الجسم اختياري ويُجرَّب لاحقاً
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
  const legacyType = legacyTypeForCategory(category);
  const seen = new Set<string>();
  const push = (body: CreateEncounterOrderBody) => {
    const key = JSON.stringify(body);
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(body);
  };

  const candidates: CreateEncounterOrderBody[] = [];

  push({ patientId: pid });
  push(draftManualPlaceholderBody(category, pid));
  if (eid) {
    push(draftManualPlaceholderBody(category, pid, eid));
  }

  if (legacyType) {
    push({ patientId: pid, type: legacyType });
    push({ patientId: pid, category: legacyType });
  }

  if (catalogItemId?.trim()) {
    push(catalogItemsBody(pid, catalogItemId.trim(), eid));
    push(catalogItemsBody(pid, catalogItemId.trim()));
  }

  if (eid) {
    push({ patientId: pid, encounterId: eid });
    if (legacyType) {
      push({ patientId: pid, encounterId: eid, type: legacyType });
    }
    if (catalogItemId?.trim()) {
      push(catalogItemsBody(pid, catalogItemId.trim(), eid));
    }
  }

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
    )[0] ?? { patientId }
  );
}

function formatValidationErrors(error: ApiError): string | null {
  const errors = error.body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const hint = errors
    .map((entry) => {
      const row = entry as { path?: string; msg?: string; value?: unknown };
      const path = row.path?.trim();
      const msg = row.msg?.trim();
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
  const urgency =
    mapClinicalUrgencyTextToApi(clinical.urgency) ??
    (clinical.urgency.trim() || undefined);

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
        displayName: title,
        type: modality || undefined,
        modality: modality || undefined,
        bodyArea: bodyArea || undefined,
        bodyPart: bodyArea || undefined,
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
