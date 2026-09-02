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

function readEncounterOrderRecordString(
  record: { _id?: unknown; id?: unknown } | undefined,
  key: '_id' | 'id',
): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

export function resolveEncounterOrderIdFromCreateResponse(
  response: EncounterOrderResponse,
): string {
  const order = asEncounterOrderCreateRecord(response.order);
  const root = asEncounterOrderCreateRecord(response);
  const id =
    readEncounterOrderRecordString(order, '_id') ??
    readEncounterOrderRecordString(order, 'id') ??
    response.orderId?.trim() ??
    readEncounterOrderRecordString(root, '_id');
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
  locale: 'ar' | 'en' = 'ar',
): ImagingOrderItemBody {
  const isEn = locale === 'en';
  switch (category) {
    case 'lab': {
      const label = isEn ? 'Lab draft' : 'مسودة تحليل';
      return { title: label, name: label, displayName: label, testName: label };
    }
    case 'radiology': {
      const label = isEn ? 'Imaging draft' : 'مسودة أشعة';
      return { title: label, name: label, displayName: label };
    }
    case 'procedure': {
      const label = isEn ? 'Procedure draft' : 'مسودة إجراء';
      return { title: label, name: label, displayName: label, procedureName: label };
    }
    default: {
      const label = isEn ? 'Draft' : 'مسودة';
      return { title: label, name: label };
    }
  }
}

/** بند يدوي بسيط لإنشاء مسودة عندما لا يتوفر عنصر كتالوج صالح */
export function draftManualPlaceholderBody(
  category: EncounterOrderCategoryKey,
  patientId: string,
  locale: 'ar' | 'en' = 'ar',
): CreateEncounterOrderBody {
  const pid = patientId.trim();
  const item = draftPlaceholderItem(category, locale);
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
  locale: 'ar' | 'en' = 'ar',
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

  push(draftManualPlaceholderBody(category, pid, locale));

  const item = draftPlaceholderItem(category, locale);
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
  locale: 'ar' | 'en' = 'ar',
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

  push(draftManualPlaceholderBody(category, pid, locale));

  const item = draftPlaceholderItem(category, locale);
  push({ patientId: pid, items: [item] });
  push({ patientId: pid, manualItems: [item] });

  if (category === 'referral') {
    const specialty = locale === 'en' ? 'General specialty' : 'اختصاص عام';
    const reason =
      locale === 'en' ? 'Referral from the encounter' : 'تحويل من الزيارة الطبية';
    return [
      {
        patientId: pid,
        specialty,
        reason,
        ...(eid ? { encounterId: eid } : {}),
      },
      {
        specialty,
        reason,
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
  locale: 'ar' | 'en' = 'ar',
): CreateEncounterOrderBody {
  return (
    buildEncounterOrderCreateCandidates(
      category,
      patientId,
      encounterId,
      catalogItemId,
      locale,
    )[0] ?? draftManualPlaceholderBody(category, patientId, locale)
  );
}

function asValidationErrorRow(
  value: unknown,
): { path?: unknown; msg?: unknown; value?: unknown } | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

function readValidationRowString(
  row: { path?: unknown; msg?: unknown; value?: unknown } | undefined,
  key: 'path' | 'msg',
): string | undefined {
  const value = row?.[key];
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function formatValidationErrors(
  error: ApiError,
  locale: 'ar' | 'en' = 'ar',
): string | null {
  const errors = error.body.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const hint = errors
    .map((entry) => {
      const row = asValidationErrorRow(entry);
      const path = readValidationRowString(row, 'path');
      const msg = readValidationRowString(row, 'msg');
      if (path === 'patientId') {
        return locale === 'en'
          ? 'The patient identifier (patientId) is required or invalid'
          : 'معرّف المريض (patientId) مطلوب أو غير صالح';
      }
      if (path === 'encounterId') {
        return locale === 'en'
          ? 'The encounter identifier (encounterId) is not accepted in the request body'
          : 'معرّف الزيارة (encounterId) غير مقبول في جسم الطلب';
      }
      if (path === 'orderType' || path === 'type' || path === 'category') {
        return locale === 'en'
          ? `The type field (${path}) is not accepted here`
          : `حقل النوع (${path}) غير مقبول هنا`;
      }
      if (
        path === 'catalogItems' ||
        path === 'manualItems' ||
        path === 'items'
      ) {
        return locale === 'en'
          ? 'At least one lab/imaging item is required (from the catalog or manually)'
          : 'يلزم بند تحليل/فحص واحد على الأقل (من الكتالوج أو يدوياً)';
      }
      if (path && msg) return `${path}: ${msg}`;
      if (path) return path;
      return msg;
    })
    .filter(Boolean)
    .join(locale === 'en' ? '; ' : '؛ ');

  return hint || null;
}

/** رسالة أوضح (عربي/إنجليزي حسب اللغة النشطة) عند فشل إنشاء/تحميل طلب الزيارة (خصوصاً 422). */
export function getEncounterOrderRequestErrorMessage(
  error: unknown,
  locale: 'ar' | 'en' = 'ar',
): string {
  if (
    error instanceof Error &&
    error.message === 'errors.orders.finalizeRequiresItems'
  ) {
    return locale === 'en'
      ? 'You must add at least one item before final approval.'
      : 'يجب إضافة بند واحد على الأقل قبل الاعتماد النهائي.';
  }

  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error, locale);
  }

  if (error.status === 422 || error.status === 400) {
    const validationHint = formatValidationErrors(error, locale);
    if (validationHint) {
      return locale === 'en'
        ? `Could not create the order: ${validationHint}.`
        : `تعذّر إنشاء الطلب: ${validationHint}.`;
    }
  }

  return locale === 'ar'
    ? localizeOrderStatusesInMessage(error.message)
    : getUserFacingRequestErrorMessage(error, locale);
}

export function isEncounterOrderCreateValidationError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 400 || error.status === 422;
}

export function mapClinicalFormToOrderPatch(
  category: EncounterOrderCategoryKey,
  clinical: RadiologyClinicalForm,
  locale: 'ar' | 'en' = 'ar',
): UpdateEncounterOrderBody {
  const urgency = mapClinicalUrgencyTextToApi(clinical.urgency);

  if (category === 'lab') {
    const labParts = [
      clinical.requiresFasting
        ? locale === 'en'
          ? 'Requires fasting'
          : 'يتطلب الصيام'
        : '',
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
