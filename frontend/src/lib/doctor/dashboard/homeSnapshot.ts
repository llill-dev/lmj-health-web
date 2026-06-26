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

export type DoctorHomeSnapshot = {
  counts?: DoctorHomeSnapshotCounts;
  pendingAccessRequestAlert?: {
    count?: number;
    latestRequest?: DoctorHomeSnapshotAccessRequest | null;
  };
  nextAppointment?: Record<string, unknown> | null;
  activeConsultation?: Record<string, unknown> | null;
  nearestWaitlistRequest?: Record<string, unknown> | null;
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
