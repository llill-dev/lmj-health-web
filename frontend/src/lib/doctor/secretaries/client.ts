import { del, get, post, put } from '@/lib/api';
import { doctorSecretaryEndpoints } from '@/lib/doctor/secretaries/endpoints';
import { normalizeDoctorSecretary } from '@/lib/doctor/secretaries/formUtils';
import type {
  CreateDoctorSecretaryBody,
  DoctorSecretariesListResponse,
  DoctorSecretary,
  UpdateDoctorSecretaryBody,
} from '@/lib/doctor/secretaries/types';

function unwrapSecretaryPayload(payload: unknown): DoctorSecretary | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
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
    const response = await get<unknown>(doctorSecretaryEndpoints.byId(secretaryId));
    return unwrapSecretaryPayload(response);
  },

  create: (body: CreateDoctorSecretaryBody) =>
    post<{ secretary?: DoctorSecretary; message?: string }>(
      doctorSecretaryEndpoints.list,
      body,
    ),

  update: (secretaryId: string, body: UpdateDoctorSecretaryBody) =>
    put<{ secretary?: DoctorSecretary; message?: string }>(
      doctorSecretaryEndpoints.byId(secretaryId),
      body,
    ),

  unassign: (secretaryId: string) =>
    del<{ message?: string }>(doctorSecretaryEndpoints.unassign(secretaryId)),
};

export const doctorSecretariesQueryKeys = {
  all: ['doctor', 'secretaries'] as const,
  list: () => [...doctorSecretariesQueryKeys.all, 'list'] as const,
  detail: (id: string) =>
    [...doctorSecretariesQueryKeys.all, 'detail', id] as const,
};
