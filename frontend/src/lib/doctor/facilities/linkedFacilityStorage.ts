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

function parseStoredLinkedFacility(
  raw: string,
): StoredLinkedFacilityRecord | null {
  return asStoredLinkedFacilityRecord(JSON.parse(raw));
}

function readStoredLinkedFacilityString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function hasStoredLinkedFacilityShape(value: unknown): value is DoctorFacility {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Partial<DoctorFacility>;
  return Boolean(
    readStoredLinkedFacilityString(record.id) &&
    readStoredLinkedFacilityString(record.name),
  );
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
    const parsed = parseStoredLinkedFacility(raw);
    const facility = parsed?.facility;
    if (!hasStoredLinkedFacilityShape(facility)) return null;
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
