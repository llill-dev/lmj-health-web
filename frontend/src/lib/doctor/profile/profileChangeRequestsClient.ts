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
  data?: unknown;
  item?: unknown;
  result?: unknown;
};

export type DoctorProfileChangeRequestInput = {
  items: DoctorProfileChangeItem[];
  reason?: string;
};

type DoctorProfileChangeRequestsEnvelope = {
  requests?: unknown;
  request?: unknown;
  items?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  results?: unknown;
};

function asDoctorProfileChangeRequestsEnvelope(
  value: unknown,
): DoctorProfileChangeRequestsEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorProfileChangeRequestsEnvelope)
    : null;
}

function isDoctorProfileChangeRequestArray(
  value: unknown,
): value is DoctorProfileChangeRequest[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  );
}

function readDoctorProfileChangeRequestRecord(
  value: unknown,
): DoctorProfileChangeRequest | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorProfileChangeRequest)
    : null;
}

function readDoctorProfileChangeRequestArray(
  value: unknown,
): DoctorProfileChangeRequest[] | null {
  return isDoctorProfileChangeRequestArray(value) ? value : null;
}

function readDoctorProfileChangeRequestNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readDoctorProfileChangeRequests(
  value: unknown,
): DoctorProfileChangeRequest[] | null {
  const record = asDoctorProfileChangeRequestsEnvelope(value);
  if (!record) return null;

  return (
    readDoctorProfileChangeRequestArray(record.requests) ??
    readDoctorProfileChangeRequestArray(record.items) ??
    readDoctorProfileChangeRequests(record.data) ??
    readDoctorProfileChangeRequests(record.result)
  );
}

function readDoctorProfileChangeRequest(
  value: unknown,
): DoctorProfileChangeRequest | null {
  const record = asDoctorProfileChangeRequestsEnvelope(value);
  if (!record) return null;

  const request =
    readDoctorProfileChangeRequestRecord(record.request) ??
    readDoctorProfileChangeRequestRecord(record.item) ??
    (asDoctorProfileChangeRequestsEnvelope(record.data)
      ? readDoctorProfileChangeRequest(
          asDoctorProfileChangeRequestsEnvelope(record.data)?.request ?? record.data,
        )
      : null) ??
    (asDoctorProfileChangeRequestsEnvelope(record.result)
      ? readDoctorProfileChangeRequest(
          asDoctorProfileChangeRequestsEnvelope(record.result)?.request ?? record.result,
        )
      : null) ??
    readDoctorProfileChangeRequestRecord(record.data) ??
    readDoctorProfileChangeRequestRecord(record.result);

  return request ?? null;
}

function normalizeDoctorProfileChangeRequestsListResponse(
  response: DoctorProfileChangeRequestsListResponse,
): DoctorProfileChangeRequestsListResponse {
  const requests = readDoctorProfileChangeRequests(response) ?? [];
  const record = asDoctorProfileChangeRequestsEnvelope(response);
  const nested =
    asDoctorProfileChangeRequestsEnvelope(record?.data) ??
    asDoctorProfileChangeRequestsEnvelope(record?.result);

  return {
    ...response,
    requests,
    page:
      readDoctorProfileChangeRequestNumber(response.page) ??
      readDoctorProfileChangeRequestNumber(nested?.page) ??
      response.page,
    limit:
      readDoctorProfileChangeRequestNumber(response.limit) ??
      readDoctorProfileChangeRequestNumber(nested?.limit) ??
      response.limit,
    total:
      readDoctorProfileChangeRequestNumber(response.total) ??
      readDoctorProfileChangeRequestNumber(nested?.total) ??
      response.total,
    results:
      readDoctorProfileChangeRequestNumber(response.results) ??
      readDoctorProfileChangeRequestNumber(nested?.results) ??
      requests.length,
  };
}

function normalizeDoctorProfileChangeRequestResponse(
  response: DoctorProfileChangeRequestResponse,
): DoctorProfileChangeRequestResponse {
  const request = readDoctorProfileChangeRequest(response);
  return request ? { ...response, request } : response;
}

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
    ).then(normalizeDoctorProfileChangeRequestsListResponse);
  },

  submit: (input: DoctorProfileChangeRequestInput) =>
    post<DoctorProfileChangeRequestResponse>(
      doctorEndpoints.me.profileChangeRequests,
      input,
      { locale: 'ar' },
    ).then(normalizeDoctorProfileChangeRequestResponse),
};
