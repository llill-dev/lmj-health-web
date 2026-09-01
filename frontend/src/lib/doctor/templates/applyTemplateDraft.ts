import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import type { PrescriptionDraftForm } from '@/components/doctor/prescription/prescription-types';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { RadiologyOrderItemUi } from '@/components/doctor/radiology/radiology-types';
import type { ReferralFormState } from '@/lib/doctor/referrals/referralFormSchema';
import { mapReferralPriorityFromApi } from '@/lib/doctor/referrals/referralPriority';
import type {
  DoctorTemplateApplication,
  DoctorTemplateType,
} from '@/lib/doctor/templates/templateTypes';
import { getCurrentLocale } from '@/i18n/runtime';

type TemplateDraftRecord = {
  [key: string]: unknown;
};

type TemplateDraftItem = TemplateDraftRecord;

function asRecord(value: unknown): TemplateDraftRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as TemplateDraftRecord)
    : {};
}

function asString(...values: ReadonlyArray<unknown>): string | undefined {
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
  application: DoctorTemplateApplication,
): TemplateDraftItem[] {
  const keys = [
    'items',
    'medications',
    'lines',
    'tests',
    'procedures',
    'orderItems',
  ];
  const merged: TemplateDraftItem[] = [];

  for (const key of keys) {
    const value = application[key];
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      const record = entry && typeof entry === 'object' && !Array.isArray(entry)
        ? entry
        : null;
      if (record) merged.push(record);
    }
  }

  return merged;
}

export function parsePrescriptionTemplateDraft(
  application: DoctorTemplateApplication,
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
  application: DoctorTemplateApplication,
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
  application: DoctorTemplateApplication,
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
      category:
        asString(record.category, record.section) ??
        (getCurrentLocale() === 'en' ? 'Template' : 'قالب'),
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

export function parseReferralTemplateDraft(
  application: DoctorTemplateApplication,
): Partial<ReferralFormState> {
  const draft: Partial<ReferralFormState> = {};

  const referralType = asString(application.referralType, application.type);
  const specialty = asString(application.specialty, application.specialisation);
  const reason = asString(
    application.reason,
    application.clinicalReason,
    application.indication,
  );
  const referredDoctorName = asString(
    application.referredDoctorName,
    application.doctorName,
    application.referredDoctor,
  );
  const institution = asString(application.institution, application.facility);
  const clinicalSummary = asString(
    application.clinicalSummary,
    application.summary,
    application.clinicalHistory,
  );
  const questionsToColleague = asString(
    application.questionsToColleague,
    application.questions,
    application.questionsForColleague,
  );
  const notes = asString(application.notes, application.additionalNotes);
  const urgencyRaw = asString(application.urgency, application.priority);
  const priority = urgencyRaw
    ? mapReferralPriorityFromApi(urgencyRaw)
    : undefined;

  if (referralType) draft.referralType = referralType;
  if (specialty) draft.specialty = specialty;
  if (reason) draft.reason = reason;
  if (referredDoctorName) draft.referredDoctorName = referredDoctorName;
  if (institution) draft.institution = institution;
  if (clinicalSummary) draft.clinicalSummary = clinicalSummary;
  if (questionsToColleague) draft.questionsToColleague = questionsToColleague;
  if (notes) draft.notes = notes;
  if (priority) draft.priority = priority;

  return draft;
}
