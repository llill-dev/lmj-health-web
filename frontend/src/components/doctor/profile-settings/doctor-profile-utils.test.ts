import { describe, expect, it } from 'vitest';
import { buildProfessionalChangeItems } from '@/components/doctor/profile-settings/doctor-profile-utils';
import type { DoctorProfileRecord } from '@/lib/doctor/profile/profileClient';

const baseDoctor: DoctorProfileRecord = {
  medicalLicenseNumber: 'MED-12345',
  specialization: 'طب القلب',
  education: 'دكتوراه في طب القلب',
  clinicAddress: 'جرمانا',
  locationCountry: 'سوريا',
  locationCity: 'دمشق',
  clinicLat: 33.5,
  clinicLng: 36.2,
};

describe('buildProfessionalChangeItems', () => {
  it('returns empty array when nothing changed', () => {
    const items = buildProfessionalChangeItems(baseDoctor, {
      medicalLicenseNumber: 'MED-12345',
      specialization: 'طب القلب',
      education: 'دكتوراه في طب القلب',
      clinicAddress: 'جرمانا',
      locationCountry: 'سوريا',
      locationCity: 'دمشق',
      clinicLat: '33.5',
      clinicLng: '36.2',
    });
    expect(items).toEqual([]);
  });

  it('includes only changed fields', () => {
    const items = buildProfessionalChangeItems(baseDoctor, {
      medicalLicenseNumber: 'MED-99999',
      specialization: 'طب القلب',
      education: 'دكتوراه محدّثة في طب القلب',
      clinicAddress: 'جرمانا',
      locationCountry: 'سوريا',
      locationCity: 'دمشق',
      clinicLat: '33.5',
      clinicLng: '36.2',
    });

    expect(items).toEqual([
      { field: 'medicalLicenseNumber', newValue: 'MED-99999' },
      { field: 'education', newValue: 'دكتوراه محدّثة في طب القلب' },
    ]);
  });

  it('includes coordinate changes when both lat and lng provided', () => {
    const items = buildProfessionalChangeItems(baseDoctor, {
      medicalLicenseNumber: 'MED-12345',
      specialization: 'طب القلب',
      education: 'دكتوراه في طب القلب',
      clinicAddress: 'جرمانا',
      locationCountry: 'سوريا',
      locationCity: 'دمشق',
      clinicLat: '33.5138',
      clinicLng: '36.2765',
    });

    expect(items).toEqual([
      { field: 'clinicLat', newValue: '33.5138' },
      { field: 'clinicLng', newValue: '36.2765' },
    ]);
  });
});
