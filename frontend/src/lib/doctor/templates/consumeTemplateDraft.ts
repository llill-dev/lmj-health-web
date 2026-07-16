import {
  parseOrderClinicalTemplateDraft,
  parseOrderItemTemplateDrafts,
  parsePrescriptionTemplateDraft,
  parseReferralTemplateDraft,
} from '@/lib/doctor/templates/applyTemplateDraft';
import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import type { PrescriptionDraftForm } from '@/components/doctor/prescription/prescription-types';
import type { RadiologyClinicalForm } from '@/components/doctor/radiology/radiology-types';
import type { RadiologyOrderItemUi } from '@/components/doctor/radiology/radiology-types';
import type { ReferralFormState } from '@/lib/doctor/referrals/referralFormSchema';
import type { StoredDoctorTemplateDraft } from '@/lib/doctor/templates/templateDraftStorage';

export type TemplateDraftConsumeSkipReason =
  | 'existing_items'
  | 'partial_failure'
  | 'empty';

export type TemplateDraftConsumeResult = {
  consumed: boolean;
  skipReason?: TemplateDraftConsumeSkipReason;
  appliedInstructions: boolean;
  appliedItemCount: number;
};

export async function consumePrescriptionTemplateDraft(input: {
  draft: StoredDoctorTemplateDraft;
  existingInstructions: string;
  existingItemCount: number;
  setGeneralInstructions: (value: string) => void;
  addItem: (item: PrescriptionDraftForm) => Promise<unknown>;
}): Promise<TemplateDraftConsumeResult> {
  const parsed = parsePrescriptionTemplateDraft(input.draft.application);
  let appliedInstructions = false;
  let appliedItemCount = 0;

  const hasInstructions = Boolean(parsed.generalInstructions?.trim());
  const hasItems = parsed.items.length > 0;

  if (!hasInstructions && !hasItems) {
    return {
      consumed: true,
      skipReason: 'empty',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  if (hasItems && input.existingItemCount > 0) {
    return {
      consumed: false,
      skipReason: 'existing_items',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  if (
    hasInstructions &&
    !input.existingInstructions.trim() &&
    parsed.generalInstructions
  ) {
    input.setGeneralInstructions(parsed.generalInstructions);
    appliedInstructions = true;
  }

  if (hasItems && input.existingItemCount === 0) {
    for (const item of parsed.items) {
      try {
        await input.addItem(item);
        appliedItemCount += 1;
      } catch {
        return {
          consumed: appliedInstructions || appliedItemCount > 0,
          skipReason: 'partial_failure',
          appliedInstructions,
          appliedItemCount,
        };
      }
    }
  }

  return {
    consumed: appliedInstructions || appliedItemCount > 0 || !hasItems,
    appliedInstructions,
    appliedItemCount,
  };
}

export async function consumeOrderTemplateDraft(input: {
  draft: StoredDoctorTemplateDraft;
  category: CatalogOrderCategory;
  existingClinical: RadiologyClinicalForm;
  existingItemCount: number;
  setClinical: (next: RadiologyClinicalForm) => void;
  addItem: (item: Omit<RadiologyOrderItemUi, 'id'>) => Promise<unknown>;
}): Promise<TemplateDraftConsumeResult> {
  const clinicalDraft = parseOrderClinicalTemplateDraft(
    input.draft.application,
    input.category,
  );
  const itemDrafts = parseOrderItemTemplateDrafts(input.draft.application);

  const hasClinical = Object.keys(clinicalDraft).length > 0;
  const hasItems = itemDrafts.length > 0;

  if (!hasClinical && !hasItems) {
    return {
      consumed: true,
      skipReason: 'empty',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  if (hasItems && input.existingItemCount > 0) {
    return {
      consumed: false,
      skipReason: 'existing_items',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  let appliedInstructions = false;
  let appliedItemCount = 0;

  if (hasClinical) {
    const current = input.existingClinical;
    const next: RadiologyClinicalForm = { ...current };
    let changed = false;

    if (!current.clinicalReason?.trim() && clinicalDraft.clinicalReason) {
      next.clinicalReason = clinicalDraft.clinicalReason;
      changed = true;
    }
    if (
      !current.instructionsToPatient?.trim() &&
      clinicalDraft.instructionsToPatient
    ) {
      next.instructionsToPatient = clinicalDraft.instructionsToPatient;
      changed = true;
    }
    if (
      !current.imagingCenterInstructions?.trim() &&
      clinicalDraft.imagingCenterInstructions
    ) {
      next.imagingCenterInstructions = clinicalDraft.imagingCenterInstructions;
      changed = true;
    }
    if (!current.urgency?.trim() && clinicalDraft.urgency) {
      next.urgency = clinicalDraft.urgency;
      changed = true;
    }
    if (
      input.category === 'lab' &&
      clinicalDraft.requiresFasting != null &&
      current.requiresFasting == null
    ) {
      next.requiresFasting = clinicalDraft.requiresFasting;
      changed = true;
    }

    if (changed) {
      input.setClinical(next);
      appliedInstructions = true;
    }
  }

  if (hasItems && input.existingItemCount === 0) {
    for (const item of itemDrafts) {
      try {
        await input.addItem(item);
        appliedItemCount += 1;
      } catch {
        return {
          consumed: appliedInstructions || appliedItemCount > 0,
          skipReason: 'partial_failure',
          appliedInstructions,
          appliedItemCount,
        };
      }
    }
  }

  return {
    consumed: appliedInstructions || appliedItemCount > 0 || !hasItems,
    appliedInstructions,
    appliedItemCount,
  };
}

const REFERRAL_STRING_FIELDS = [
  'referralType',
  'specialty',
  'reason',
  'referredDoctorName',
  'institution',
  'clinicalSummary',
  'questionsToColleague',
  'notes',
] as const satisfies ReadonlyArray<
  Exclude<keyof ReferralFormState, 'priority'>
>;

export function consumeReferralTemplateDraft(input: {
  draft: StoredDoctorTemplateDraft;
  existingForm: ReferralFormState;
  setForm: (next: ReferralFormState) => void;
}): TemplateDraftConsumeResult {
  const parsed = parseReferralTemplateDraft(input.draft.application);

  const hasData =
    REFERRAL_STRING_FIELDS.some((key) => Boolean(parsed[key]?.trim())) ||
    parsed.priority != null;

  if (!hasData) {
    return {
      consumed: true,
      skipReason: 'empty',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  if (
    input.existingForm.specialty.trim() ||
    input.existingForm.reason.trim()
  ) {
    return {
      consumed: false,
      skipReason: 'existing_items',
      appliedInstructions: false,
      appliedItemCount: 0,
    };
  }

  const next: ReferralFormState = { ...input.existingForm };
  let appliedFieldCount = 0;

  for (const key of REFERRAL_STRING_FIELDS) {
    const value = parsed[key];
    if (typeof value !== 'string' || !value.trim()) continue;
    if (!next[key].trim()) {
      next[key] = value;
      appliedFieldCount += 1;
    }
  }

  if (parsed.priority && input.existingForm.priority === 'normal') {
    next.priority = parsed.priority;
    appliedFieldCount += 1;
  }

  if (appliedFieldCount > 0) {
    input.setForm(next);
  }

  return {
    consumed: appliedFieldCount > 0,
    appliedInstructions: appliedFieldCount > 0,
    appliedItemCount: appliedFieldCount,
  };
}
