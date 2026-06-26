import { describe, expect, it } from 'vitest';
import {
  doctorProfileApi,
  normalizeProfileDateOfBirth,
} from '@/lib/doctor/profile/profileClient';

describe('doctorProfileApi.patchProfile payload', () => {
  it('appends consultationTypes as repeated fields (not JSON)', async () => {
    const originalPatch = doctorProfileApi.patchProfile;
    let capturedForm: FormData | null = null;

    doctorProfileApi.patchProfile = (input) => {
      const form = new FormData();
      if (input.fullName) form.append('fullName', input.fullName);
      if (input.consultationTypes?.length) {
        for (const type of input.consultationTypes) {
          form.append('consultationTypes', type);
        }
      }
      capturedForm = form;
      return Promise.resolve({ doctor: {} });
    };

    await doctorProfileApi.patchProfile({
      fullName: 'د. خالد',
      consultationTypes: ['online', 'offline'],
    });

    doctorProfileApi.patchProfile = originalPatch;

    expect(capturedForm?.getAll('consultationTypes')).toEqual([
      'online',
      'offline',
    ]);
    expect(capturedForm?.get('consultationTypes')).not.toContain('[');
  });
});

describe('normalizeProfileDateOfBirth', () => {
  it('keeps YYYY-MM-DD as-is', () => {
    expect(normalizeProfileDateOfBirth('1982-05-15')).toBe('1982-05-15');
  });

  it('normalizes ISO datetime to calendar date', () => {
    expect(normalizeProfileDateOfBirth('1982-05-15T00:00:00.000Z')).toBe(
      '1982-05-15',
    );
  });
});
