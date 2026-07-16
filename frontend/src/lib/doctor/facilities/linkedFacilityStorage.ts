import type { DoctorFacility } from '@/lib/doctor/facilities/types';

const STORAGE_KEY = 'doctor.linkedFacility';

type StoredLinkedFacility = {
  facility: DoctorFacility;
  linkedAt: string;
};

type StoredLinkedFacilityRecord = {
  facility?: DoctorFacility | null;
  linkedAt?: string;
};

function asStoredLinkedFacilityRecord(
  value: unknown,
): StoredLinkedFacilityRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function parseStoredLinkedFacility(raw: string): unknown {
  return JSON.parse(raw);
}

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

export function storeLinkedDoctorFacility(facility: DoctorFacility): void {
  if (!canUseSessionStorage()) return;
  const payload: StoredLinkedFacility = {
    facility: { ...facility, isOwned: false },
    linkedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readLinkedDoctorFacility(): DoctorFacility | null {
  if (!canUseSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = asStoredLinkedFacilityRecord(parseStoredLinkedFacility(raw));
    const facility = parsed?.facility;
    if (!facility?.id || !facility.name) return null;
    return { ...facility, isOwned: false };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearLinkedDoctorFacility(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}
