import { doctorApi } from '@/lib/doctor/client';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';

function readEncounterPrescriptionsList(
  value: { prescriptions?: EncounterPrescriptionRecord[] } | null | undefined,
): EncounterPrescriptionRecord[] {
  return Array.isArray(value?.prescriptions) ? value.prescriptions : [];
}

function readPrescriptionUpdatedAt(
  value: EncounterPrescriptionRecord,
): string | undefined {
  const record: unknown = value;
  if (!record || typeof record !== 'object' || Array.isArray(record)) return undefined;
  const candidate: { updatedAt?: unknown } = record;
  return typeof candidate.updatedAt === 'string' ? candidate.updatedAt : undefined;
}

function readPrescriptionTimestamp(
  prescription: EncounterPrescriptionRecord,
): number {
  const value = prescription.finalizedAt ?? readPrescriptionUpdatedAt(prescription);
  return value ? new Date(value).getTime() : 0;
}

function isFinalizedPrescription(rx: EncounterPrescriptionRecord) {
  return (rx.status ?? '').toLowerCase().includes('final');
}

function sortByRecent(
  prescriptions: EncounterPrescriptionRecord[],
): EncounterPrescriptionRecord[] {
  return [...prescriptions].sort((a, b) => {
    const aTime = readPrescriptionTimestamp(a);
    const bTime = readPrescriptionTimestamp(b);
    return bTime - aTime;
  });
}

async function fetchPrescriptionDetail(
  doctorId: string,
  patientId: string,
  encounterId: string,
  prescriptionId: string,
): Promise<EncounterPrescriptionRecord> {
  const response = await doctorApi.patients.getEncounterPrescription(
    doctorId,
    patientId,
    encounterId,
    prescriptionId,
  );
  return response.prescription;
}

/** يحمّل الوصفة مع بنود الأدوية (تفاصيل كاملة وليس ملخص القائمة فقط). */
export async function loadEncounterPrescriptionWithItems(
  doctorId: string,
  patientId: string,
  encounterId: string,
  prescriptionId: string,
): Promise<EncounterPrescriptionRecord> {
  return fetchPrescriptionDetail(
    doctorId,
    patientId,
    encounterId,
    prescriptionId,
  );
}

/**
 * مسودة للتحرير، أو آخر وصفة معتمدة للعرض، أو إنشاء مسودة جديدة فقط إن لم يوجد أي وصفة.
 */
export async function loadEncounterPrescriptionForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
): Promise<EncounterPrescriptionRecord> {
  const list = await doctorApi.patients.listEncounterPrescriptions(
    doctorId,
    patientId,
    encounterId,
    { limit: 50, page: 1 },
  );

  const all = readEncounterPrescriptionsList(list);
  const draft = all.find((rx) => !isFinalizedPrescription(rx));

  if (draft?._id) {
    return fetchPrescriptionDetail(
      doctorId,
      patientId,
      encounterId,
      draft._id,
    );
  }

  const latest = sortByRecent(all)[0];
  if (latest?._id) {
    return fetchPrescriptionDetail(
      doctorId,
      patientId,
      encounterId,
      latest._id,
    );
  }

  const created = await doctorApi.patients.createEncounterPrescription(
    doctorId,
    patientId,
    encounterId,
    {},
  );

  return fetchPrescriptionDetail(
    doctorId,
    patientId,
    encounterId,
    created.prescription._id,
  );
}

/** للمعاينة: مسودة أولاً وإلا أحدث وصفة في الزيارة. */
export async function loadEncounterPrescriptionForPreview(
  doctorId: string,
  patientId: string,
  encounterId: string,
): Promise<EncounterPrescriptionRecord | null> {
  const list = await doctorApi.patients.listEncounterPrescriptions(
    doctorId,
    patientId,
    encounterId,
    { limit: 50, page: 1 },
  );

  const all = readEncounterPrescriptionsList(list);
  const draft = all.find((rx) => !isFinalizedPrescription(rx));
  const target = draft ?? sortByRecent(all)[0];
  if (!target?._id) return null;

  return fetchPrescriptionDetail(
    doctorId,
    patientId,
    encounterId,
    target._id,
  );
}

/** لملخص الزيارة: كل الوصفات مع بنود الأدوية. */
export async function loadEncounterPrescriptionsForSummary(
  doctorId: string,
  patientId: string,
  encounterId: string,
): Promise<EncounterPrescriptionRecord[]> {
  const list = await doctorApi.patients.listEncounterPrescriptions(
    doctorId,
    patientId,
    encounterId,
    { limit: 100, page: 1 },
  );

  const prescriptions = readEncounterPrescriptionsList(list);
  if (prescriptions.length === 0) return [];

  const full = await Promise.all(
    prescriptions
      .filter((rx) => rx._id)
      .map((rx) =>
        fetchPrescriptionDetail(
          doctorId,
          patientId,
          encounterId,
          rx._id!,
        ),
      ),
  );

  return sortByRecent(full);
}
