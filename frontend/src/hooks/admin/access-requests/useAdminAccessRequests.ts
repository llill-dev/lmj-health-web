'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminAccessRequestDetailsResponse,
  AdminAccessRequestSummary,
  AdminAccessRequestsListResponse,
} from '@/lib/admin/types';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

type AccessRequestParty = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  publicId?: string;
  specialization?: string;
};

export type AdminAccessRequestUi = AdminAccessRequestSummary & {
  id: string;
  doctor: AccessRequestParty;
  patient: AccessRequestParty;
  notes?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeParty(raw: unknown, fallback: Record<string, unknown> = {}): AccessRequestParty {
  const record = asRecord(raw);
  const user = asRecord(record?.user);
  const userId = asRecord(record?.userId);

  return {
    id: firstString(record?._id, record?.id, user?._id, userId?._id),
    fullName: firstString(
      record?.fullName,
      record?.name,
      user?.fullName,
      user?.name,
      userId?.fullName,
      userId?.name,
      fallback.fullName,
      fallback.name,
    ),
    email: firstString(
      record?.email,
      user?.email,
      userId?.email,
      fallback.email,
    ),
    phone: firstString(
      record?.phone,
      user?.phone,
      userId?.phone,
      fallback.phone,
    ),
    publicId: firstString(
      record?.publicId,
      record?.patientPublicId,
      fallback.publicId,
      fallback.patientPublicId,
    ),
    specialization: firstString(
      record?.specialization,
      fallback.specialization,
    ),
  };
}

function normalizeAccessRequest(raw: unknown): AdminAccessRequestUi | null {
  const record = asRecord(raw);
  if (!record) return null;

  const doctor = normalizeParty(record.doctor, {
    fullName: record.doctorName,
    email: record.doctorEmail,
    phone: record.doctorPhone,
    specialization: record.doctorSpecialization,
  });
  const patient = normalizeParty(record.patient, {
    fullName: record.patientName,
    publicId: record.patientId,
    patientPublicId: record.patientPublicId,
  });

  const id =
    firstString(record._id, record.id, record.requestId) ??
    firstString(record.patientId, patient.publicId, doctor.id);

  if (!id) return null;

  return {
    ...(record as AdminAccessRequestSummary),
    _id: firstString(record._id, record.id, record.requestId) ?? id,
    id,
    status: firstString(record.status) ?? 'pending',
    doctorId: firstString(record.doctorId, doctor.id),
    patientId: firstString(record.patientId, patient.id, patient.publicId),
    reason: firstString(record.reason, record.requestReason),
    expiresAt: firstString(record.expiresAt),
    createdAt: firstString(record.createdAt, record.requestedAt),
    updatedAt: firstString(record.updatedAt),
    doctor,
    patient,
    notes: firstString(record.notes, record.note, record.adminNote),
  };
}

function normalizeAccessRequestListResponse(data: AdminAccessRequestsListResponse | undefined) {
  const items = data?.requests ?? data?.accessRequests ?? data?.items ?? [];
  return items
    .map((item) => normalizeAccessRequest(item))
    .filter((item): item is AdminAccessRequestUi => Boolean(item));
}

function normalizeAccessRequestDetailsResponse(
  data: AdminAccessRequestDetailsResponse | undefined,
) {
  if (!data) return null;
  return normalizeAccessRequest(
    data.request ?? data.accessRequest ?? data.item ?? data.data ?? data,
  );
}

export function useAdminAccessRequests(params: { page?: number; limit?: number; status?: string } = {}) {
  const query = useQuery<AdminAccessRequestsListResponse>({
    queryKey: ['admin-access-requests', params],
    queryFn: () => adminApi.accessRequests.list(params),
    staleTime: 1000 * 30,
  });

  const requests = normalizeAccessRequestListResponse(query.data);
  const responseTotal = query.data?.total;

  return {
    requests,
    total: typeof responseTotal === 'number' ? responseTotal : requests.length,
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 10,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminAccessRequestDetails(requestId: string | null) {
  const query = useQuery<AdminAccessRequestDetailsResponse>({
    queryKey: ['admin-access-request-details', requestId],
    queryFn: () => adminApi.accessRequests.getById(requestId!),
    enabled: !!requestId,
    staleTime: 1000 * 60,
  });

  return {
    request: normalizeAccessRequestDetailsResponse(query.data),
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}
