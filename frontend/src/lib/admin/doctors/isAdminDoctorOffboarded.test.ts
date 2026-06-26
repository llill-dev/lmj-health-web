import { describe, expect, it, beforeEach } from 'vitest';
import {
  isAdminDoctorOffboarded,
  markAdminDoctorOffboarded,
  rememberAdminDoctorOffboardedIds,
} from '@/lib/admin/doctors/isAdminDoctorOffboarded';
import type { AdminDoctorSummary } from '@/lib/admin/types';

const baseDoctor: AdminDoctorSummary = {
  _id: 'doc-1',
  approvalStatus: 'pending',
  isApproved: false,
  user: { fullName: 'Dr Test', email: 't@example.com', phone: '+963999' },
  userId: { _id: 'user-1', fullName: 'Dr Test' },
};

describe('isAdminDoctorOffboarded', () => {
  it('returns false for active doctors', () => {
    expect(isAdminDoctorOffboarded(baseDoctor)).toBe(false);
  });

  it('detects accountDeletionStatus on populated userId', () => {
    expect(
      isAdminDoctorOffboarded({
        ...baseDoctor,
        userId: { _id: 'user-1', accountDeletionStatus: 'deleted' },
      }),
    ).toBe(true);
  });

  it('detects nested accountDeletion.status', () => {
    expect(
      isAdminDoctorOffboarded({
        ...baseDoctor,
        userId: { _id: 'user-1', accountDeletion: { status: 'deleted' } },
      }),
    ).toBe(true);
  });
});

describe('markAdminDoctorOffboarded', () => {
  it('marks populated userId as deleted for cache updates', () => {
    const marked = markAdminDoctorOffboarded(baseDoctor);
    expect(marked.isApproved).toBe(false);
    expect(isAdminDoctorOffboarded(marked)).toBe(true);
  });
});

describe('rememberAdminDoctorOffboardedIds', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('remembers doctor id across refetches in the same session', () => {
    rememberAdminDoctorOffboardedIds({
      userId: 'user-1',
      doctorId: 'doc-1',
    });

    expect(isAdminDoctorOffboarded({ ...baseDoctor, userId: 'user-1' })).toBe(
      true,
    );
  });
});
