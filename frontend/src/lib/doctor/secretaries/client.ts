import { del, get, post, put } from '@/lib/api';
import { doctorSecretaryEndpoints } from '@/lib/doctor/secretaries/endpoints';
import type {
  CreateDoctorSecretaryBody,
  DoctorSecretariesListResponse,
  DoctorSecretary,
  UpdateDoctorSecretaryBody,
} from '@/lib/doctor/secretaries/types';

export const doctorSecretariesApi = {
  list: () =>
    get<DoctorSecretariesListResponse>(doctorSecretaryEndpoints.list),

  get: (secretaryId: string) =>
    get<{ secretary?: DoctorSecretary }>(
      doctorSecretaryEndpoints.byId(secretaryId),
    ).then((res) => res.secretary ?? null),

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
