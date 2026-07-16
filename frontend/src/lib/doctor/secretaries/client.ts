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
  [key: string]: unknown;
};

function asDoctorSecretaryApiRecord(
  value: unknown,
): DoctorSecretaryApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null;
}

function unwrapSecretaryPayload(payload: unknown): DoctorSecretary | null {
  const record = asDoctorSecretaryApiRecord(payload);
  if (!record) return null;
  if (record.secretary) {
    return normalizeDoctorSecretary(record.secretary);
  }

  return normalizeDoctorSecretary(record);
}

export const doctorSecretariesApi = {
  list: async () => {
    const response = await get<DoctorSecretariesListResponse>(
      doctorSecretaryEndpoints.list,
    );
    const secretaries = (response.secretaries ?? [])
      .map((item) => normalizeDoctorSecretary(item))
      .filter((item): item is DoctorSecretary => item != null);

    return {
      ...response,
      secretaries,
      total: response.total ?? secretaries.length,
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
