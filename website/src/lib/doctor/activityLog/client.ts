import { get } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import type {
  DoctorActivityLogListParams,
  DoctorActivityLogRecord,
  DoctorActivityLogListResponse,
} from '@/lib/doctor/activityLog/api-types';

type DoctorActivityLogEnvelope = {
  activityLogs?: unknown;
  items?: unknown;
  data?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  results?: unknown;
};

function asDoctorActivityLogEnvelope(value: unknown): DoctorActivityLogEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function readDoctorActivityLogNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readDoctorActivityLogListOrEmpty(
  value: DoctorActivityLogRecord[] | null,
): DoctorActivityLogRecord[] {
  return value ?? [];
}

function readDoctorActivityLogArray(
  value: unknown,
): DoctorActivityLogRecord[] | null {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  )
    ? (value as DoctorActivityLogRecord[])
    : null;
}

function readDoctorActivityLogs(value: unknown): DoctorActivityLogRecord[] | null {
  const record = asDoctorActivityLogEnvelope(value);
  if (!record) return null;

  const directLogs = readDoctorActivityLogArray(record.activityLogs);
  if (directLogs) return directLogs;
  const nestedItems = readDoctorActivityLogArray(record.items);
  if (nestedItems) return nestedItems;
  return readDoctorActivityLogs(record.data);
}

function normalizeDoctorActivityLogListResponse(
  response: DoctorActivityLogListResponse,
): DoctorActivityLogListResponse {
  const nested = asDoctorActivityLogEnvelope(asDoctorActivityLogEnvelope(response)?.data);
  const activityLogs = readDoctorActivityLogListOrEmpty(readDoctorActivityLogs(response));

  return {
    ...response,
    activityLogs,
    page:
      readDoctorActivityLogNumber(response.page) ??
      readDoctorActivityLogNumber(nested?.page) ??
      response.page,
    limit:
      readDoctorActivityLogNumber(response.limit) ??
      readDoctorActivityLogNumber(nested?.limit) ??
      response.limit,
    total:
      readDoctorActivityLogNumber(response.total) ??
      readDoctorActivityLogNumber(nested?.total) ??
      response.total,
    results:
      readDoctorActivityLogNumber(response.results) ??
      readDoctorActivityLogNumber(nested?.results) ??
      activityLogs.length,
  };
}

function buildActivityLogQuery(params: DoctorActivityLogListParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.actorRole?.trim()) qs.set('actorRole', params.actorRole.trim());
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);

  if (params.type) {
    const types = Array.isArray(params.type) ? params.type : [params.type];
    const normalized = types.map((value) => value.trim()).filter(Boolean);
    if (normalized.length) qs.set('type', normalized.join(','));
  }

  return qs.toString();
}

export const doctorActivityLogApi = {
  list: (params: DoctorActivityLogListParams = {}) => {
    const query = buildActivityLogQuery(params);
    return get<DoctorActivityLogListResponse>(
      query
        ? `${doctorEndpoints.me.activityLog}?${query}`
        : doctorEndpoints.me.activityLog,
      { locale: 'ar' },
    ).then(normalizeDoctorActivityLogListResponse);
  },
};
