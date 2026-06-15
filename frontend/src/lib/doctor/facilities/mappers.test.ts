import { describe, expect, it } from 'vitest';
import {
  formValuesToCreateRequestBody,
  formValuesToMutationBody,
  mapApiFacilityToDoctorFacility,
  parseDoctorFacilityRecordFromResponse,
  serializeDoctorFacilityMutationBody,
} from '@/lib/doctor/facilities/mappers';

describe('doctor facility mappers', () => {
  it('maps API facility into UI model with work hours from description', () => {
    const mapped = mapApiFacilityToDoctorFacility({
      _id: '65f0c4f6e6a0d0d0d0d0d901',
      name: 'عيادة الشفاء',
      facilityType: 'clinic',
      city: 'دمشق',
      address: 'المزة',
      phone: '+963944123456',
      status: 'ACTIVE',
      description: 'عيادة عامة\n\nساعات العمل: 09:00 – 17:00',
    });

    expect(mapped).toMatchObject({
      id: '65f0c4f6e6a0d0d0d0d0d901',
      name: 'عيادة الشفاء',
      status: 'active',
      description: 'عيادة عامة',
      workHoursFrom: '09:00',
      workHoursTo: '17:00',
    });
  });

  it('builds swagger-aligned mutation body with facilityType and kind', () => {
    const body = formValuesToMutationBody(
      {
        name: 'عيادة تجريبية',
        facilityType: 'clinic',
        description: 'وصف',
        city: 'دمشق',
        address: 'شارع الجلاء',
        phone: '0933875538',
        email: '',
        workHoursFrom: '09:00',
        workHoursTo: '17:00',
      },
      ['work_hours_from_0900', 'night_shift'],
    );

    expect(body).toMatchObject({
      name: 'عيادة تجريبية',
      facilityType: 'clinic',
      kind: 'clinic',
      phone: '+963933875538',
      attributes: ['night_shift'],
    });
    expect(body).not.toHaveProperty('status');
    expect(body.attributes).toEqual(['night_shift']);
    expect(body.description).toContain('ساعات العمل: 09:00 – 17:00');
  });

  it('serializes swagger POST body without empty optional fields', () => {
    const serialized = serializeDoctorFacilityMutationBody({
      name: 'عيادة تجريبية',
      city: 'دمشق',
      facilityType: 'clinic',
      kind: 'clinic',
      country: 'SY',
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
      phone: '+963944000000',
      description: 'وصف',
    });
  });

  it('builds legacy request body with kind and facilityType', () => {
    const body = formValuesToCreateRequestBody({
      name: 'عيادة تجريبية',
      facilityType: 'clinic',
      description: '',
      city: 'دمشق',
      address: 'شارع الجلاء',
      phone: '0933875538',
      email: '',
      workHoursFrom: '09:00',
      workHoursTo: '17:00',
    });

    expect(body.kind).toBe('clinic');
    expect(body.facilityType).toBe('clinic');
  });

  it('parses swagger data.id response shape', () => {
    const record = parseDoctorFacilityRecordFromResponse({
      messageKey: 'success.created',
      data: { id: '64f0c0000000000000000001' },
    });

    expect(record).toEqual({ id: '64f0c0000000000000000001' });
  });

  it('parses API-3 facility envelope', () => {
    const record = parseDoctorFacilityRecordFromResponse({
      messageKey: 'facilities.doctor.loaded',
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
