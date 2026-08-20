import { describe, expect, it } from 'vitest';
import { resolveMedicalServiceCategory } from '@/lib/doctor/medical-services-directory/category-map';
import {
  mapSuggestFacilityToDirectoryItem,
  mergeSuggestFacilities,
} from '@/lib/doctor/medical-services-directory/mappers';

describe('medical services directory mappers', () => {
  it('maps suggest facility into directory card model', () => {
    const mapped = mapSuggestFacilityToDirectoryItem(
      {
        _id: '65f0c4f6e6a0d0d0d0d0d901',
        name: 'مخبر الشفاء',
        facilityType: 'laboratory',
        city: 'دمشق',
        country: 'SY',
        address: 'دمشق — دمر',
        phone: '+963112345678',
        description: 'مخبر متخصص في التحاليل الدقيقة',
        attributes: ['pcr', 'blood_tests'],
      },
      'labs',
    );

    expect(mapped).toMatchObject({
      id: '65f0c4f6e6a0d0d0d0d0d901',
      category: 'labs',
      name: 'مخبر الشفاء',
      location: 'دمشق — دمر',
      tags: ['pcr', 'blood tests'],
      contact: {
        phone: 'tel:+963112345678',
        whatsapp: 'https://wa.me/963112345678',
      },
    });
  });

  it('merges duplicate facilities by id', () => {
    const merged = mergeSuggestFacilities(
      [
        [
          { _id: 'a1', name: 'Alpha Lab', facilityType: 'laboratory' },
          { _id: 'a2', name: 'Beta Clinic', facilityType: 'clinic' },
        ],
        [{ _id: 'a1', name: 'Alpha Lab', facilityType: 'laboratory' }],
      ],
      'labs',
    );

    expect(merged).toHaveLength(2);
    expect(new Set(merged.map((item) => item.id))).toEqual(new Set(['a1', 'a2']));
  });

  it('resolves UI categories from facility types', () => {
    expect(resolveMedicalServiceCategory('laboratory')).toBe('labs');
    expect(resolveMedicalServiceCategory('imaging_center')).toBe('imaging');
    expect(resolveMedicalServiceCategory('clinic')).toBe('clinics');
  });
});
