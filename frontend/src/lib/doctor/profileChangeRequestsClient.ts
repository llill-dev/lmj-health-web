import { get, post } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';

export type DoctorProfileChangeField =
  | 'medicalLicenseNumber'
  | 'specialization'
  | 'education'
  | 'clinicAddress'
  | 'locationCity'
  | 'locationCountry'
  | 'clinicLat'
  | 'clinicLng';

export type DoctorProfileChangeItem = {
  field: DoctorProfileChangeField;
  newValue: string | number;
};

export type DoctorProfileChangeRequest = {
  _id?: string;
  doctor?: string;
  requestedBy?: string;
  items?: DoctorProfileChangeItem[];
  reason?: string;
  status?: 'pending' | 'approved' | 'denied';
  reviewedAt?: string | null;
  adminNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorProfileChangeRequestsListResponse = {
  message?: string;
  messageKey?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  requests?: DoctorProfileChangeRequest[];
};

export type DoctorProfileChangeRequestResponse = {
  message?: string;
  messageKey?: string;
  request?: DoctorProfileChangeRequest;
};

export type DoctorProfileChangeRequestInput = {
  items: DoctorProfileChangeItem[];
  reason?: string;
};

export const doctorProfileChangeRequestsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    return get<DoctorProfileChangeRequestsListResponse>(
      `${doctorEndpoints.me.profileChangeRequests}${qs ? `?${qs}` : ''}`,
      { locale: 'ar' },
    );
  },

  submit: (input: DoctorProfileChangeRequestInput) =>
    post<DoctorProfileChangeRequestResponse>(
      doctorEndpoints.me.profileChangeRequests,
      input,
      { locale: 'ar' },
    ),
};
