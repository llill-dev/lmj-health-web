import { describe, expect, it } from 'vitest';
import {
  parseOrderItemTemplateDrafts,
  parsePrescriptionTemplateDraft,
} from '@/lib/doctor/applyTemplateDraft';

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
