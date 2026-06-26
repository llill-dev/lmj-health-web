import { describe, expect, it } from 'vitest';
import {
  buildClinicLocationChangeItems,
  extractClinicCoordinates,
  hasPendingLocationChangeRequest,
  resolveClinicVerificationStatus,
  validateClinicLocationForm,
} from '@/lib/doctor/clinicLocation/utils';
import type { DoctorProfileRecord } from '@/lib/doctor/profile/profileClient';

const doctor: DoctorProfileRecord = {
  clinicAddress: 'دمشق — جرمانا',
  clinicLat: 33.5,
  clinicLng: 36.2,
  geoStatus: 'verified',
};

describe('clinic location utils', () => {
  it('extracts coordinates from clinicLat/clinicLng', () => {
    expect(extractClinicCoordinates(doctor)).toEqual({
      lat: 33.5,
      lng: 36.2,
    });
  });

  it('extracts coordinates from clinicLocation point', () => {
    expect(
      extractClinicCoordinates({
        clinicLocation: { type: 'Point', coordinates: [36.2765, 33.5138] },
      }),
    ).toEqual({ lat: 33.5138, lng: 36.2765 });
  });

  it('resolves verification status from geoStatus and pending requests', () => {
    expect(resolveClinicVerificationStatus('verified', false)).toBe('verified');
    expect(resolveClinicVerificationStatus('pending', false)).toBe('pending');
    expect(resolveClinicVerificationStatus('missing', true)).toBe('pending');
  });

  it('detects pending location change requests', () => {
    expect(
      hasPendingLocationChangeRequest([
        {
          status: 'pending',
          items: [{ field: 'clinicLat', newValue: '33.51' }],
        },
      ]),
    ).toBe(true);
  });

  it('builds change items only for modified fields', () => {
    const items = buildClinicLocationChangeItems(doctor, {
      address: 'دمشق — المزة',
      lat: '33.513800',
      lng: '36.200000',
    });

    expect(items).toEqual([
      { field: 'clinicAddress', newValue: 'دمشق — المزة' },
      { field: 'clinicLat', newValue: '33.513800' },
    ]);
  });

  it('validates form values', () => {
    expect(
      validateClinicLocationForm({
        address: 'دمشق — المزة',
        lat: '33.5',
        lng: '36.2',
      }),
    ).toBeNull();

    expect(
      validateClinicLocationForm({
        address: '',
        lat: '33.5',
        lng: '36.2',
      }),
    ).toContain('عنوان');
  });
});
