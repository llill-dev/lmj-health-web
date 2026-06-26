import type { EncounterOrder } from '@/lib/doctor/encounters/encounterClinicalTypes';
import type { EncounterOrderItem } from '@/lib/doctor/encounters/encounterClinicalTypes';
import { resolveOrderStatusLabelAr } from '@/lib/doctor/orders/orderStatusLabels';
import { mapClinicalUrgencyFromApi } from '@/lib/doctor/referrals/referralPriority';
import type { ImagingOrderItemBody } from '@/lib/doctor/encounters/encounterOrderTypes';
import type {
  RadiologyClinicalForm,
  RadiologyManualForm,
  RadiologyOrderItemUi,
} from './radiology-types';

const PLACEHOLDER_MARKERS = new Set([
  '—',
  'غير محدد',
  'مسودة أشعة',
  'مسودة تحليل',
  'مسودة إجراء',
]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || PLACEHOLDER_MARKERS.has(trimmed)) continue;
    return trimmed;
  }
  return undefined;
}

function parseItemNotes(notes?: string) {
  if (!notes?.trim()) return {};
  try {
    const parsed = JSON.parse(notes) as Record<string, string>;
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    return { notes: notes.trim() };
  }
  return {};
}

export function resolveImagingOrderItemFields(
  item: EncounterOrderItem,
): Omit<RadiologyOrderItemUi, 'id'> {
  const meta = parseItemNotes(item.notes);
  const details = asRecord(item.details);
  const data = asRecord(item.data);

  const name =
    readString(
      item.title,
      item.name,
      item.testName,
      item.displayName,
      item.displayNameAr,
      item.displayNameEn,
      data.displayName,
      data.displayNameAr,
      data.displayNameEn,
      data.name,
      data.title,
      details.displayName,
      details.displayNameAr,
      meta.name,
    ) ?? 'فحص أشعة';

  const category =
    readString(
      meta.category,
      item.category,
      details.category,
      data.category,
      data.section,
    ) ?? '—';

  const type =
    readString(
      meta.type,
      item.type,
      details.type,
      data.type,
      item.modality,
      details.modality,
      data.modality,
    ) ?? '—';

  const bodyArea =
    readString(
      meta.bodyArea,
      item.bodyArea,
      item.bodyPart,
      details.bodyArea,
      details.bodyPart,
      data.bodyArea,
      data.bodyPart,
    ) ?? '—';

  const side =
    readString(meta.side, item.side, details.side, data.side) ?? '—';

  const position =
    readString(meta.position, item.position, details.position, data.position) ??
    '—';

  const plainNotes = readString(meta.notes, item.notes);
  const notes = plainNotes ?? '—';

  return {
    name,
    category,
    type,
    bodyArea,
    side,
    position,
    notes,
    catalogItemId: item.catalogItemId,
  };
}

/** سطر مختصر تحت اسم الفحص (بطاقة الزيارة / القائمة المطوية). */
export function formatRadiologyItemBrief(
  item: Pick<RadiologyOrderItemUi, 'type' | 'bodyArea' | 'category'>,
): string {
  const parts = [
    item.type !== '—' ? item.type : '',
    item.bodyArea !== '—' ? item.bodyArea : '',
    item.category !== '—' && item.category !== 'كتالوج' && item.category !== 'يدوي'
      ? item.category
      : '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' • ') : '';
}

export function mapRadiologyItemsToUi(
  order?: EncounterOrder | null,
): RadiologyOrderItemUi[] {
  return (order?.items ?? [])
    .filter((item) => item._id)
    .map((item) => ({
      id: item._id!,
      ...resolveImagingOrderItemFields(item),
    }));
}

export function mapUiItemToApiBody(
  item: Omit<RadiologyOrderItemUi, 'id'>,
): ImagingOrderItemBody {
  return {
    title: item.name.trim(),
    name: item.name.trim(),
    testName: item.name.trim(),
    catalogItemId: item.catalogItemId,
    notes: JSON.stringify({
      category: item.category?.trim() || undefined,
      type: item.type?.trim() || undefined,
      bodyArea: item.bodyArea?.trim() || undefined,
      side: item.side?.trim() || undefined,
      position: item.position?.trim() || undefined,
      notes: item.notes?.trim() || undefined,
    }),
  };
}

export function mapManualFormToUiItem(
  values: RadiologyManualForm,
): Omit<RadiologyOrderItemUi, 'id'> {
  return {
    name: values.name.trim(),
    category: 'يدوي',
    type: values.type.trim() || '—',
    bodyArea: values.bodyArea.trim() || '—',
    side: values.side.trim() || '—',
    position: values.position.trim() || '—',
    notes: values.notes.trim() || '—',
  };
}

export function mapOrderToClinicalForm(
  order?: EncounterOrder | null,
  category?: 'lab' | 'radiology' | 'procedure' | 'referral',
): RadiologyClinicalForm {
  const o = order as {
    clinicalReason?: string;
    urgency?: string;
    instructionsToPatient?: string;
    imagingCenterInstructions?: string;
    imagingCenterInstruction?: string;
    labInstructions?: string;
    notes?: string;
  } | null;

  const labRaw =
    o?.labInstructions?.trim() ??
    o?.imagingCenterInstructions?.trim() ??
    o?.imagingCenterInstruction?.trim() ??
    '';
  const requiresFasting = /صيام|fasting/i.test(labRaw);
  const labCenter = labRaw
    .replace(/يتطلب\s*صيام\s*[—–-]?\s*/gi, '')
    .trim();

  if (category === 'procedure') {
    return {
      urgency: mapClinicalUrgencyFromApi(o?.urgency),
      clinicalReason: '',
      instructionsToPatient:
        o?.instructionsToPatient?.trim() ?? o?.notes?.trim() ?? '',
      imagingCenterInstructions: '',
    };
  }

  return {
    urgency: mapClinicalUrgencyFromApi(o?.urgency),
    clinicalReason: o?.clinicalReason?.trim() ?? '',
    instructionsToPatient: o?.instructionsToPatient?.trim() ?? '',
    imagingCenterInstructions: labCenter,
    requiresFasting: category === 'lab' ? requiresFasting : undefined,
  };
}

export function resolveRadiologyStatusLabel(order?: EncounterOrder | null) {
  return resolveOrderStatusLabelAr(order?.statusCode, order?.status);
}

export function isRadiologyOrderEditable(
  order?: EncounterOrder | null,
  encounterStatus?: string,
) {
  if (encounterStatus === 'closed') return false;
  const status = `${order?.status ?? ''} ${order?.statusCode ?? ''}`.toLowerCase();
  return !status.includes('final') && !status.includes('complete');
}

export function buildRadiologyPatientSubtitle(patientName?: string) {
  const name = patientName?.trim();
  if (!name || name === '—') return 'طلبات الأشعة';
  return `طلب الأشعة الخاص بالمريض ${name}`;
}

export function formatRadiologyOrderCode(orderId: string) {
  const year = new Date().getFullYear();
  const suffix = orderId.slice(-3).toUpperCase();
  return `IMG-${year}-${suffix.padStart(3, '0')}`;
}
