import { describe, expect, it } from 'vitest';
import {
  parseOrderItemTemplateDrafts,
  parsePrescriptionTemplateDraft,
  parseReferralTemplateDraft,
} from '@/lib/doctor/applyTemplateDraft';
import { consumeReferralTemplateDraft } from '@/lib/doctor/consumeTemplateDraft';
import type { ReferralFormState } from '@/lib/doctor/referralFormSchema';
import type { StoredDoctorTemplateDraft } from '@/lib/doctor/templateDraftStorage';

describe('parsePrescriptionTemplateDraft', () => {
  it('reads medications alias and general instructions', () => {
    const parsed = parsePrescriptionTemplateDraft({
      generalInstructions: 'تناول مع الطعام',
      medications: [
        { medicationName: 'أموكسيسيلين', dosage: '500mg', frequency: 'مرتين' },
      ],
    });

    expect(parsed.generalInstructions).toBe('تناول مع الطعام');
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.name).toBe('أموكسيسيلين');
  });
});

describe('parseOrderItemTemplateDrafts', () => {
  it('merges tests and procedures arrays', () => {
    const items = parseOrderItemTemplateDrafts({
      tests: [{ testName: 'CBC', category: 'دم' }],
      procedures: [{ procedureName: 'خزعة', type: 'جلدية' }],
    });

    expect(items).toHaveLength(2);
    expect(items[0]?.name).toBe('CBC');
    expect(items[1]?.name).toBe('خزعة');
  });
});

describe('parseReferralTemplateDraft', () => {
  it('maps referral fields and urgency aliases', () => {
    const parsed = parseReferralTemplateDraft({
      referralType: 'داخلي',
      specialty: 'قلب',
      clinicalReason: 'ألم صدري',
      referredDoctorName: 'د. أحمد',
      institution: 'مستشفى الملك',
      clinicalSummary: 'مريض يعاني من ألم متكرر',
      questions: 'هل يلزم قسطرة؟',
      notes: 'متابعة عاجلة',
      urgency: 'high',
    });

    expect(parsed.referralType).toBe('داخلي');
    expect(parsed.specialty).toBe('قلب');
    expect(parsed.reason).toBe('ألم صدري');
    expect(parsed.referredDoctorName).toBe('د. أحمد');
    expect(parsed.institution).toBe('مستشفى الملك');
    expect(parsed.clinicalSummary).toBe('مريض يعاني من ألم متكرر');
    expect(parsed.questionsToColleague).toBe('هل يلزم قسطرة؟');
    expect(parsed.notes).toBe('متابعة عاجلة');
    expect(parsed.priority).toBe('emergency');
  });
});

describe('consumeReferralTemplateDraft', () => {
  const emptyForm: ReferralFormState = {
    referralType: '',
    specialty: '',
    reason: '',
    referredDoctorName: '',
    institution: '',
    clinicalSummary: '',
    questionsToColleague: '',
    notes: '',
    priority: 'normal',
  };

  const draft: StoredDoctorTemplateDraft = {
    templateId: 'tpl-1',
    type: 'REFERRAL_ORDER',
    name: 'إحالة قلب',
    storedAt: new Date().toISOString(),
    application: {
      specialty: 'قلب',
      reason: 'ألم صدري',
      urgency: 'medium',
    },
  };

  it('fills empty referral fields only', () => {
    let nextForm = emptyForm;
    const result = consumeReferralTemplateDraft({
      draft,
      existingForm: emptyForm,
      setForm: (next) => {
        nextForm = next;
      },
    });

    expect(result.consumed).toBe(true);
    expect(result.appliedItemCount).toBe(3);
    expect(nextForm.specialty).toBe('قلب');
    expect(nextForm.reason).toBe('ألم صدري');
    expect(nextForm.priority).toBe('urgent');
  });

  it('keeps draft when referral already has specialty or reason', () => {
    const result = consumeReferralTemplateDraft({
      draft,
      existingForm: { ...emptyForm, specialty: 'جلدية' },
      setForm: () => undefined,
    });

    expect(result.consumed).toBe(false);
    expect(result.skipReason).toBe('existing_items');
  });
});
