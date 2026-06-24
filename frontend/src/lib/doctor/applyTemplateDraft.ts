import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import type { PrescriptionDraftForm } from '@/components/doctor/prescription/prescription-types';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { RadiologyOrderItemUi } from '@/components/doctor/radiology/radiology-types';
import type { DoctorTemplateType } from '@/lib/doctor/templateTypes';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function orderCategoryForTemplateType(
  type: DoctorTemplateType,
): CatalogOrderCategory | null {
  switch (type) {
    case 'LAB_ORDER':
      return 'lab';
    case 'IMAGING_ORDER':
      return 'radiology';
    case 'PROCEDURE_ORDER':
      return 'procedure';
    default:
      return null;
  }
}

function collectApplicationItemArrays(
  application: Record<string, unknown>,
): unknown[] {
  const keys = [
    'items',
    'medications',
    'lines',
    'tests',
    'procedures',
    'orderItems',
  ];
  const merged: unknown[] = [];

  for (const key of keys) {
    const value = application[key];
    if (Array.isArray(value)) merged.push(...value);
  }

  return merged;
}

export function parsePrescriptionTemplateDraft(
  application: Record<string, unknown>,
): {
  generalInstructions?: string;
  items: PrescriptionDraftForm[];
} {
  const generalInstructions = asString(
    application.generalInstructions,
    application.instructions,
    application.notes,
  );

  const items: PrescriptionDraftForm[] = [];
  const rawItems = collectApplicationItemArrays(application);

  for (const raw of rawItems) {
    const record = asRecord(raw);
    const name = asString(
      record.name,
      record.medicationName,
      record.displayName,
      record.title,
    );
    if (!name) continue;

    items.push({
      name,
      dosage: asString(record.dosage) ?? '',
      frequency: asString(record.frequency) ?? '',
      duration: asString(record.duration) ?? '',
    });
  }

  return { generalInstructions, items };
}

export function parseOrderClinicalTemplateDraft(
  application: Record<string, unknown>,
  category: CatalogOrderCategory,
): Partial<RadiologyClinicalForm> {
  const clinicalReason = asString(
    application.clinicalReason,
    application.indication,
    application.reason,
  );
  const instructionsToPatient = asString(
    application.instructionsToPatient,
    application.patientInstructions,
    category === 'procedure' ? application.notes : undefined,
  );
  const imagingCenterInstructions = asString(
    application.imagingCenterInstructions,
    application.labInstructions,
    application.centerInstructions,
  );
  const urgency = asString(application.urgency, application.priority);

  const draft: Partial<RadiologyClinicalForm> = {};
  if (clinicalReason) draft.clinicalReason = clinicalReason;
  if (instructionsToPatient) draft.instructionsToPatient = instructionsToPatient;
  if (imagingCenterInstructions) {
    draft.imagingCenterInstructions = imagingCenterInstructions;
  }
  if (urgency) draft.urgency = urgency;

  if (category === 'lab' && typeof application.requiresFasting === 'boolean') {
    draft.requiresFasting = application.requiresFasting;
  }

  return draft;
}

export function parseOrderItemTemplateDrafts(
  application: Record<string, unknown>,
): Array<Omit<RadiologyOrderItemUi, 'id'>> {
  const rawItems = collectApplicationItemArrays(application);
  const items: Array<Omit<RadiologyOrderItemUi, 'id'>> = [];

  for (const raw of rawItems) {
    const record = asRecord(raw);
    const name = asString(
      record.displayName,
      record.name,
      record.title,
      record.testName,
      record.procedureName,
      record.imagingName,
    );
    if (!name) continue;

    items.push({
      name,
      category: asString(record.category, record.section) ?? 'قالب',
      type: asString(record.type, record.modality) ?? '—',
      bodyArea: asString(record.bodyArea, record.bodyPart) ?? '—',
      side: asString(record.side) ?? '—',
      position: asString(record.position) ?? '—',
      notes: asString(record.notes) ?? '—',
      catalogItemId: asString(record.catalogItemId, record.itemId),
    });
  }

  return items;
}
