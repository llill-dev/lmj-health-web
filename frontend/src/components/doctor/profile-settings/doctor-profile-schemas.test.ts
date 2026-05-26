import { describe, expect, it } from 'vitest';
import {
  PROFILE_FIELD_MESSAGES,
  doctorPersonalEditSchema,
  doctorProfessionalEditSchema,
} from '@/components/doctor/profile-settings/doctor-profile-schemas';

describe('doctorPersonalEditSchema', () => {
  const validBase = {
    fullName: 'د. خالد عبدالله',
    dateOfBirth: '1982-05-15',
    address: 'دمشق — حي النهضة',
    bio: '',
    consultationFee: '50000',
    consultationMode: 'both' as const,
  };

  it('accepts valid personal data', () => {
    const result = doctorPersonalEditSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects empty required fullName', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      fullName: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PROFILE_FIELD_MESSAGES.fullNameRequired,
      );
    }
  });

  it('rejects short address', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      address: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'address')).toBe(
        true,
      );
    }
  });

  it('rejects bio longer than 200 chars', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      bio: 'أ'.repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PROFILE_FIELD_MESSAGES.bioMax,
      );
    }
  });

  it('allows empty optional consultationFee', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      consultationFee: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid consultationFee', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      consultationFee: '-10',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PROFILE_FIELD_MESSAGES.consultationFeeInvalid,
      );
    }
  });

  it('rejects future dateOfBirth', () => {
    const result = doctorPersonalEditSchema.safeParse({
      ...validBase,
      dateOfBirth: '2099-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PROFILE_FIELD_MESSAGES.dateOfBirthFuture,
      );
    }
  });
});

describe('doctorProfessionalEditSchema', () => {
  const validBase = {
    medicalLicenseNumber: 'MED-12345',
    specialization: 'طب القلب',
    education: 'دكتوراه في طب القلب',
    clinicAddress: 'جرمانا — حي النهضة',
    locationCountry: 'سوريا',
    locationCity: 'دمشق',
    clinicLat: '33.5138',
    clinicLng: '36.2765',
  };

  it('accepts valid professional data', () => {
    const result = doctorProfessionalEditSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects missing medical license', () => {
    const result = doctorProfessionalEditSchema.safeParse({
      ...validBase,
      medicalLicenseNumber: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PROFILE_FIELD_MESSAGES.medicalLicenseRequired,
      );
    }
  });

  it('requires lat and lng together', () => {
    const result = doctorProfessionalEditSchema.safeParse({
      ...validBase,
      clinicLng: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'clinicLng')).toBe(
        true,
      );
    }
  });

  it('allows empty optional coordinates', () => {
    const result = doctorProfessionalEditSchema.safeParse({
      ...validBase,
      clinicLat: '',
      clinicLng: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid latitude', () => {
    const result = doctorProfessionalEditSchema.safeParse({
      ...validBase,
      clinicLat: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'clinicLat')).toBe(
        true,
      );
    }
  });
});
