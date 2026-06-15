import { doctorApi } from '@/lib/doctor/client';
import type { DoctorEncounterSummary } from '@/lib/doctor/types';

export type ConsultationClinicalAction = 'lab' | 'imaging' | 'prescription';

const CONSULTATION_ENCOUNTER_MARKER_PREFIX = '[consultation:';
const SESSION_KEY_PREFIX = 'lmj:consultation-encounter:';

export function buildConsultationEncounterMarker(consultationId: string): string {
  return `${CONSULTATION_ENCOUNTER_MARKER_PREFIX}${consultationId.trim()}]`;
}

export function encounterMatchesConsultation(
  encounter: Pick<DoctorEncounterSummary, 'notes' | 'status'>,
  consultationId: string,
): boolean {
  if ((encounter.status ?? '').toLowerCase() === 'closed') return false;
  const marker = buildConsultationEncounterMarker(consultationId);
  return encounter.notes?.includes(marker) ?? false;
}

export function buildConsultationEncounterNotes(input: {
  consultationId: string;
  subject?: string | null;
}): string {
  const subject = input.subject?.trim() || 'استشارة أونلاين';
  const marker = buildConsultationEncounterMarker(input.consultationId);
  return `${subject}\n${marker}`;
}

/** يعرض ملاحظات الزيارة للطبيب بدون العلامة الداخلية [consultation:...]. */
export function formatEncounterNotesForDisplay(notes?: string | null): string {
  const raw = notes?.trim();
  if (!raw) return '';
  return raw
    .replace(/\[consultation:[^\]]+\]/gi, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function buildConsultationClinicalPath(
  patientId: string,
  encounterId: string,
  action: ConsultationClinicalAction,
  returnTo?: string,
): string {
  const base = `/doctor/encounters/${encodeURIComponent(patientId)}/${encodeURIComponent(encounterId)}`;
  const path =
    action === 'lab'
      ? `${base}/lab`
      : action === 'imaging'
        ? `${base}/radiology`
        : `${base}/prescription`;

  if (!returnTo?.trim()) return path;
  const search = new URLSearchParams({ returnTo: returnTo.trim() });
  return `${path}?${search.toString()}`;
}

function readCachedEncounterId(consultationId: string): string | null {
  try {
    return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${consultationId}`);
  } catch {
    return null;
  }
}

function writeCachedEncounterId(consultationId: string, encounterId: string) {
  try {
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${consultationId}`, encounterId);
  } catch {
    /* ignore */
  }
}

async function verifyOpenEncounter(
  doctorId: string,
  patientId: string,
  encounterId: string,
  consultationId: string,
): Promise<string | null> {
  try {
    const response = await doctorApi.patients.getEncounter(
      doctorId,
      patientId,
      encounterId,
    );
    const encounter = response.encounter;
    if (!encounter?._id) return null;
    if (!encounterMatchesConsultation(encounter, consultationId)) return null;
    return encounter._id;
  } catch {
    return null;
  }
}

function pickConsultationEncounter(
  encounters: DoctorEncounterSummary[],
  consultationId: string,
): string | null {
  const match = encounters.find((encounter) =>
    encounterMatchesConsultation(encounter, consultationId),
  );
  return match?._id ?? null;
}

/** يضمن الربط الكанонي بين الطبيب والمريض (idempotent). */
export async function ensurePatientLinked(
  doctorId: string,
  patientId: string,
): Promise<void> {
  if (!doctorId || !patientId) {
    throw new Error('missing doctor or patient id for link');
  }
  await doctorApi.patients.linkPatient(doctorId, patientId);
}

/** يعيد زيارة مفتوحة مرتبطة بالاستشارة أو ينشئ واحدة جديدة. */
export async function ensureConsultationEncounter(input: {
  doctorId: string;
  patientId: string;
  consultationId: string;
  subject?: string | null;
}): Promise<string> {
  const { doctorId, patientId, consultationId, subject } = input;
  if (!doctorId || !patientId || !consultationId) {
    throw new Error('missing consultation clinical context');
  }

  await ensurePatientLinked(doctorId, patientId);

  const cached = readCachedEncounterId(consultationId);
  if (cached) {
    const verified = await verifyOpenEncounter(
      doctorId,
      patientId,
      cached,
      consultationId,
    );
    if (verified) return verified;
  }

  const list = await doctorApi.patients.listEncounters(doctorId, patientId, {
    status: 'open',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 30,
  });

  const existing = pickConsultationEncounter(
    list.encounters ?? [],
    consultationId,
  );
  if (existing) {
    writeCachedEncounterId(consultationId, existing);
    return existing;
  }

  const created = await doctorApi.patients.createEncounter(doctorId, patientId, {
    origin: 'manual',
    notes: buildConsultationEncounterNotes({ consultationId, subject }),
  });

  const encounterId = created.encounter?._id;
  if (!encounterId) {
    throw new Error('missing encounter id after create');
  }

  writeCachedEncounterId(consultationId, encounterId);
  return encounterId;
}
