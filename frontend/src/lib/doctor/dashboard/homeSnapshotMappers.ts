import type {
  DoctorHomeSnapshot,
  DoctorHomeSnapshotAppointment,
} from '@/lib/doctor/dashboard/homeSnapshot';

export type SnapshotActiveConsultation = {
  ticketId: string;
  subject?: string;
  patientName?: string;
  status?: string;
  unreadCount?: number;
};

export type SnapshotNearestWaitlist = {
  requestId: string;
  patientName?: string;
  status?: string;
  urgencyLevel?: string;
};

type DoctorHomeSnapshotRecord = {
  [key: string]: unknown;
};

type SnapshotAppointmentLike = DoctorHomeSnapshotRecord & {
  _id?: unknown;
  id?: unknown;
  patientName?: unknown;
  patientSummary?: {
    userId?: {
      fullName?: unknown;
    };
  };
};

function asSnapshotAppointmentLike(
  value: unknown,
): SnapshotAppointmentLike | null {
  const record = asRecord(value);
  return record ? record : null;
}

function asRecord(value: unknown): DoctorHomeSnapshotRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorHomeSnapshotRecord)
    : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readId(raw: SnapshotAppointmentLike): string | undefined {
  return readString(raw._id) ?? readString(raw.id);
}

function readSnapshotPatientName(
  raw: SnapshotAppointmentLike,
): string | undefined {
  const direct = readString(raw.patientName);
  if (direct) return direct;

  return readString(raw.patientSummary?.userId?.fullName);
}

export function parseSnapshotActiveConsultation(
  raw: DoctorHomeSnapshot['activeConsultation'],
): SnapshotActiveConsultation | null {
  const record = asSnapshotAppointmentLike(raw);
  if (!record) return null;

  const ticketId = readId(record);
  if (!ticketId) return null;

  return {
    ticketId,
    subject: readString(record.subject),
    patientName: readSnapshotPatientName(record),
    status: readString(record.status),
    unreadCount:
      typeof record.unreadCount === 'number' ? record.unreadCount : undefined,
  };
}

export function parseSnapshotNearestWaitlist(
  raw: DoctorHomeSnapshot['nearestWaitlistRequest'],
): SnapshotNearestWaitlist | null {
  const record = asSnapshotAppointmentLike(raw);
  if (!record) return null;

  const requestId = readId(record);
  if (!requestId) return null;

  return {
    requestId,
    patientName: readSnapshotPatientName(record),
    status: readString(record.status),
    urgencyLevel: readString(record.urgencyLevel),
  };
}

export function doctorConsultationDeepLink(ticketId: string): string {
  return `/doctor/online-consultations?ticket=${encodeURIComponent(ticketId)}`;
}

export function doctorWaitlistDeepLink(requestId: string): string {
  return `/doctor/waitlist?request=${encodeURIComponent(requestId)}`;
}
