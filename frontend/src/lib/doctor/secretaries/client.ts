import { del, get, post, put } from '@/lib/api';
import { doctorSecretaryEndpoints } from '@/lib/doctor/secretaries/endpoints';
import { normalizeDoctorSecretary } from '@/lib/doctor/secretaries/formUtils';
import type {
  CreateDoctorSecretaryBody,
  DoctorSecretaryDeleteResponse,
  DoctorSecretariesListResponse,
  DoctorSecretary,
  DoctorSecretaryMutationResponse,
  DoctorSecretaryResponse,
  UpdateDoctorSecretaryBody,
} from '@/lib/doctor/secretaries/types';

type DoctorSecretaryApiRecord = {
  secretary?: unknown;
  secretaries?: unknown;
  items?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

function asDoctorSecretaryApiRecord(
  value: unknown,
): DoctorSecretaryApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DoctorSecretaryApiRecord)
    : null;
}

function readDoctorSecretaryNestedRecord(
  value: unknown,
): DoctorSecretaryApiRecord | null {
  const record = asDoctorSecretaryApiRecord(value);
  return (
    asDoctorSecretaryApiRecord(record?.data) ??
    asDoctorSecretaryApiRecord(record?.item) ??
    null
  );
}

function readDoctorSecretaryNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readDoctorSecretaryArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function readFirstDoctorSecretaryArray(
  sources: unknown[],
): unknown[] | null {
  for (const source of sources) {
    const items = readDoctorSecretaryArray(source);
    if (items) return items;
  }
  return null;
}

function unwrapSecretaryPayload(payload: unknown): DoctorSecretary | null {
  const record = asDoctorSecretaryApiRecord(payload);
  if (!record) return null;
  if (record.secretary) {
    return normalizeDoctorSecretary(record.secretary);
  }
  if ('item' in record && record.item) {
    const nested = normalizeDoctorSecretary(record.item);
    if (nested) return nested;
  }
  const nestedRecord = readDoctorSecretaryNestedRecord(record);
  if (nestedRecord) {
    const nested =
      unwrapSecretaryPayload(nestedRecord) ?? normalizeDoctorSecretary(nestedRecord);
    if (nested) return nested;
  }

  return normalizeDoctorSecretary(record);
}

function readSecretaryList(payload: unknown): DoctorSecretary[] {
  const record = asDoctorSecretaryApiRecord(payload);
  if (!record) return [];

  const nested = readDoctorSecretaryNestedRecord(record);
  const candidate = readFirstDoctorSecretaryArray([
    record.secretaries,
    record.items,
    nested?.secretaries,
    nested?.items,
    nested?.data,
  ]);

  if (!candidate) return [];

  return candidate
    .map((item) => normalizeDoctorSecretary(item))
    .filter((item): item is DoctorSecretary => item != null);
}

function readSecretaryTotal(payload: unknown, fallbackTotal: number): number {
  const record = asDoctorSecretaryApiRecord(payload);
  if (!record) return fallbackTotal;
  const directTotal = readDoctorSecretaryNumber(record.total);
  if (directTotal != null) return directTotal;
  const nested = readDoctorSecretaryNestedRecord(record);
  const nestedTotal = readDoctorSecretaryNumber(nested?.total);
  if (nestedTotal != null) return nestedTotal;
  return fallbackTotal;
}

export const doctorSecretariesApi = {
  list: async () => {
    const response = await get<DoctorSecretariesListResponse>(
      doctorSecretaryEndpoints.list,
    );
    const secretaries = readSecretaryList(response);

    return {
      ...response,
      secretaries,
      total: readSecretaryTotal(response, secretaries.length),
    } satisfies DoctorSecretariesListResponse;
  },

  get: async (secretaryId: string) => {
    const response = await get<DoctorSecretaryResponse>(
      doctorSecretaryEndpoints.byId(secretaryId),
    );
    return unwrapSecretaryPayload(response);
  },

  create: async (body: CreateDoctorSecretaryBody) => {
    const response = await post<DoctorSecretaryMutationResponse>(
      doctorSecretaryEndpoints.list,
      body,
    );

    return {
      ...response,
      secretary: unwrapSecretaryPayload(response) ?? response.secretary,
    } satisfies DoctorSecretaryMutationResponse;
  },

  update: async (secretaryId: string, body: UpdateDoctorSecretaryBody) => {
    const response = await put<DoctorSecretaryMutationResponse>(
      doctorSecretaryEndpoints.byId(secretaryId),
      body,
    );

    return {
      ...response,
      secretary: unwrapSecretaryPayload(response) ?? response.secretary,
    } satisfies DoctorSecretaryMutationResponse;
  },

  unassign: (secretaryId: string) =>
    del<DoctorSecretaryDeleteResponse>(
      doctorSecretaryEndpoints.unassign(secretaryId),
    ),
};

export const doctorSecretariesQueryKeys = {
  all: ['doctor', 'secretaries'] as const,
  list: () => [...doctorSecretariesQueryKeys.all, 'list'] as const,
  detail: (id: string) =>
    [...doctorSecretariesQueryKeys.all, 'detail', id] as const,
};
