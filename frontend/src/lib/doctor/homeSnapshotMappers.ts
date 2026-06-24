import type { DoctorHomeSnapshot } from '@/lib/doctor/homeSnapshot';

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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readId(raw: Record<string, unknown>): string | undefined {
  return readString(raw._id) ?? readString(raw.id);
}

function readSnapshotPatientName(raw: Record<string, unknown>): string | undefined {
  const direct = readString(raw.patientName);
  if (direct) return direct;

  const summary = asRecord(raw.patientSummary);
  const userId = summary ? asRecord(summary.userId) : null;
  return readString(userId?.fullName);
}

export function parseSnapshotActiveConsultation(
  raw: DoctorHomeSnapshot['activeConsultation'],
): SnapshotActiveConsultation | null {
  const record = asRecord(raw);
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
  const record = asRecord(raw);
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
