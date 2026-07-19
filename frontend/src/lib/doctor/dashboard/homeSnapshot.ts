import { get } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';

export type DoctorHomeSnapshotCounts = {
  appointments?: number;
  consultations?: number;
  waitlist?: number;
};

export type DoctorHomeSnapshotAccessRequest = {
  _id?: string;
  patientId?: string;
  patientPublicId?: string;
  patientName?: string;
  patientPhotoUrl?: string | null;
  status?: string;
  reason?: string;
};

export type DoctorHomeSnapshotPatientSummary = {
  _id?: string;
  publicId?: string;
  userId?: {
    _id?: string;
    fullName?: string;
  };
};

export type DoctorHomeSnapshotAppointment = {
  _id?: string;
  id?: string;
  status?: string;
  subject?: string;
  patientName?: string;
  unreadCount?: number;
  urgencyLevel?: string;
  patientSummary?: DoctorHomeSnapshotPatientSummary;
};

export type DoctorHomeSnapshot = {
  counts?: DoctorHomeSnapshotCounts;
  pendingAccessRequestAlert?: {
    count?: number;
    latestRequest?: DoctorHomeSnapshotAccessRequest | null;
  };
  nextAppointment?: DoctorHomeSnapshotAppointment | null;
  activeConsultation?: DoctorHomeSnapshotAppointment | null;
  nearestWaitlistRequest?: DoctorHomeSnapshotAppointment | null;
};

export type DoctorHomeSnapshotResponse = {
  message?: string;
  messageKey?: string;
  snapshot?: DoctorHomeSnapshot;
  data?: unknown;
  item?: unknown;
  result?: unknown;
};

type DoctorHomeSnapshotEnvelope = {
  snapshot?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
};

function asDoctorHomeSnapshotEnvelope(
  value: unknown,
): DoctorHomeSnapshotEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorHomeSnapshotEnvelope)
    : null;
}

function asDoctorHomeSnapshotRecord(value: unknown): DoctorHomeSnapshot | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorHomeSnapshot)
    : null;
}

function readNestedHomeSnapshot(
  value: unknown,
): DoctorHomeSnapshot | null {
  const record = asDoctorHomeSnapshotEnvelope(value);
  if (!record) return asDoctorHomeSnapshotRecord(value);
  return (
    asDoctorHomeSnapshotRecord(record.snapshot) ??
    asDoctorHomeSnapshotRecord(record.item) ??
    asDoctorHomeSnapshotRecord(record.data) ??
    asDoctorHomeSnapshotRecord(record.result)
  );
}

function readDoctorHomeSnapshot(value: unknown): DoctorHomeSnapshot | null {
  const record = asDoctorHomeSnapshotEnvelope(value);
  if (!record) return null;

  return (
    asDoctorHomeSnapshotRecord(record.snapshot) ??
    asDoctorHomeSnapshotRecord(record.item) ??
    readNestedHomeSnapshot(record.data) ??
    readNestedHomeSnapshot(record.result)
  );
}

function normalizeDoctorHomeSnapshotResponse(
  response: DoctorHomeSnapshotResponse,
): DoctorHomeSnapshotResponse {
  const snapshot = readDoctorHomeSnapshot(response);
  return snapshot ? { ...response, snapshot } : response;
}

export const doctorHomeApi = {
  getSnapshot: () =>
    get<DoctorHomeSnapshotResponse>(doctorEndpoints.home.snapshot, {
      locale: 'ar',
    }).then(normalizeDoctorHomeSnapshotResponse),
};
