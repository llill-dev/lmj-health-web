import { describe, expect, it } from 'vitest';
import {
  formValuesToMutationBody,
  mapApiFacilityToDoctorFacility,
  parseDoctorFacilityRecordFromResponse,
  serializeDoctorFacilityMutationBody,
} from '@/lib/doctor/facilities/mappers';

describe('doctor facility mappers', () => {
  it('maps API facility into UI model without smuggling work hours into description', () => {
    const mapped = mapApiFacilityToDoctorFacility({
      _id: '65f0c4f6e6a0d0d0d0d0d901',
      name: 'عيادة الشفاء',
      facilityType: 'clinic',
      city: 'دمشق',
      address: 'المزة',
      phone: '+963944123456',
      status: 'ACTIVE',
      description: 'عيادة عامة',
    });

    expect(mapped).toMatchObject({
      id: '65f0c4f6e6a0d0d0d0d0d901',
      name: 'عيادة الشفاء',
      status: 'active',
      description: 'عيادة عامة',
    });
    expect(mapped).not.toHaveProperty('workHoursFrom');
    expect(mapped).not.toHaveProperty('email');
  });

  it('builds Swagger mutation body with both facilityType and kind', () => {
    const body = formValuesToMutationBody(
      {
        name: 'عيادة تجريبية',
        facilityType: 'clinic',
        description: 'وصف',
        city: 'دمشق',
        country: 'سوريا',
        address: 'شارع الجلاء',
        phone: '0933875538',
      },
      ['work_hours_from_0900', 'night_shift'],
    );

    expect(body).toMatchObject({
      name: 'عيادة تجريبية',
      facilityType: 'clinic',
      kind: 'clinic',
      country: 'سوريا',
      address: 'شارع الجلاء',
      phone: '+963933875538',
      description: 'وصف',
      attributes: ['night_shift'],
    });
    expect(body).not.toHaveProperty('status');
    expect(body.attributes).toEqual(['night_shift']);
  });

  it('serializes Swagger POST body (keeps kind, always sends attributes array)', () => {
    const serialized = serializeDoctorFacilityMutationBody({
      name: 'عيادة تجريبية',
      city: 'دمشق',
      facilityType: 'clinic',
      kind: 'clinic',
      country: 'SY',
      address: 'شارع الجلاء',
      phone: '+963944000000',
      description: 'وصف',
      attributes: [],
    });

    expect(serialized).toEqual({
      name: 'عيادة تجريبية',
      city: 'دمشق',
      facilityType: 'clinic',
      kind: 'clinic',
      country: 'SY',
      address: 'شارع الجلاء',
      phone: '+963944000000',
      description: 'وصف',
      attributes: [],
    });
  });

  it('parses swagger data.id response shape', () => {
    const record = parseDoctorFacilityRecordFromResponse({
      messageKey: 'success.created',
      data: { id: '64f0c0000000000000000001' },
    });

    expect(record).toEqual({ id: '64f0c0000000000000000001' });
  });

  it('parses API facility envelope', () => {
    const record = parseDoctorFacilityRecordFromResponse({
      messageKey: 'success.ok',
      facility: {
        id: '64f0c0000000000000000001',
        name: 'City Clinic',
        city: 'Damascus',
        facilityType: 'clinic',
      },
    });

    expect(record?.name).toBe('City Clinic');
  });
});
