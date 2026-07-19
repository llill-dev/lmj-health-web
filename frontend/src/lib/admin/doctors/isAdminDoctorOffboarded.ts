import type {
  AdminDoctorDetailsDoctor,
  AdminDoctorSummary,
} from '@/lib/admin/types';
import { resolveAdminDoctorUserId } from '@/lib/admin/doctors/resolveAdminDoctorUserId';

const OFFBOARDED_USERS_KEY = 'lmj.admin.offboardedUserIds';
const OFFBOARDED_DOCTORS_KEY = 'lmj.admin.offboardedDoctorIds';

type DoctorLike = AdminDoctorSummary | AdminDoctorDetailsDoctor;
type AdminDoctorOffboardRecord = {
  [key: string]: unknown;
};
type AdminDoctorOffboardSource =
  | DoctorLike['userId']
  | DoctorLike['user']
  | DoctorLike;

function readStoredIdString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseStoredStringIds(raw: string): string[] | null {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return null;
  return parsed
    .map((id) => readStoredIdString(id))
    .filter((id): id is string => Boolean(id));
}

function readStoredIds(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = parseStoredStringIds(raw);
    return new Set(parsed ?? []);
  } catch {
    return new Set();
  }
}

function writeStoredIds(key: string, ids: Set<string>) {
  try {
    sessionStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore quota / private mode
  }
}

/** Persist offboarded ids for the current admin session (survives list refetch). */
export function rememberAdminDoctorOffboardedIds(input: {
  userId?: string | null;
  doctorId?: string | null;
}) {
  if (input.userId) {
    const userIds = readStoredIds(OFFBOARDED_USERS_KEY);
    userIds.add(input.userId);
    writeStoredIds(OFFBOARDED_USERS_KEY, userIds);
  }
  if (input.doctorId) {
    const doctorIds = readStoredIds(OFFBOARDED_DOCTORS_KEY);
    doctorIds.add(input.doctorId);
    writeStoredIds(OFFBOARDED_DOCTORS_KEY, doctorIds);
  }
}

function asRecord(v: unknown): AdminDoctorOffboardRecord | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'object' && !Array.isArray(v)) {
    return v as AdminDoctorOffboardRecord;
  }
  return undefined;
}

function readDeletionStatus(source: unknown): string | null {
  const rec = asRecord(source);
  if (!rec) return null;

  const direct = rec.accountDeletionStatus;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim().toLowerCase();
  }

  const nested = asRecord(rec.accountDeletion);
  const nestedStatus = nested?.status;
  if (typeof nestedStatus === 'string' && nestedStatus.trim()) {
    return nestedStatus.trim().toLowerCase();
  }

  return null;
}

/** True when admin offboard (or equivalent deletion) locked the linked user account. */
export function isAdminDoctorOffboarded(
  doctor: DoctorLike | null | undefined,
): boolean {
  if (!doctor) return false;

  const linkedUserId = resolveAdminDoctorUserId(doctor);
  const storedUsers = readStoredIds(OFFBOARDED_USERS_KEY);
  const storedDoctors = readStoredIds(OFFBOARDED_DOCTORS_KEY);

  if (linkedUserId && storedUsers.has(linkedUserId)) return true;
  if (doctor._id && storedDoctors.has(doctor._id)) return true;

  const sources: AdminDoctorOffboardSource[] = [doctor.userId, doctor.user, doctor];
  for (const source of sources) {
    if (readDeletionStatus(source) === 'deleted') return true;
  }

  return false;
}

/** Patch list/detail payloads after a successful offboard mutation. */
export function markAdminDoctorOffboarded<T extends DoctorLike>(doctor: T): T {
  const userId = doctor.userId;
  const nextUserId =
    userId && typeof userId === 'object'
      ? {
          ...userId,
          accountDeletionStatus: 'deleted',
          accountDeletion: { status: 'deleted' },
        }
      : userId;

  return {
    ...doctor,
    isApproved: false,
    userId: nextUserId,
  };
}
