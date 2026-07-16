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
};

export const doctorHomeApi = {
  getSnapshot: () =>
    get<DoctorHomeSnapshotResponse>(doctorEndpoints.home.snapshot, {
      locale: 'ar',
    }),
};
