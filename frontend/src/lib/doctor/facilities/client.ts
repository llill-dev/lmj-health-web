import { get, patch, post, put } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import { serializeDoctorFacilityMutationBody } from '@/lib/doctor/facilities/mappers';
import type {
  DoctorFacilityCreateRequestBody,
  DoctorFacilityMutationBody,
  DoctorFacilityResponse,
  FacilityTypesResponse,
} from '@/lib/doctor/facilities/api-types';

export const doctorFacilityApi = {
  get: () =>
    get<DoctorFacilityResponse>(doctorEndpoints.me.facility, { locale: 'ar' }),

  create: (body: DoctorFacilityMutationBody) =>
    post<DoctorFacilityResponse>(
      doctorEndpoints.me.facility,
      serializeDoctorFacilityMutationBody(body),
      { locale: 'ar' },
    ),

  createRequest: (body: DoctorFacilityCreateRequestBody) =>
    post<DoctorFacilityResponse>(doctorEndpoints.facilities.requests, body, {
      locale: 'ar',
    }),

  update: (body: DoctorFacilityMutationBody) =>
    put<DoctorFacilityResponse>(
      doctorEndpoints.me.facility,
      serializeDoctorFacilityMutationBody(body),
      { locale: 'ar' },
    ),

  updateAttributes: (attributes: string[]) =>
    patch<DoctorFacilityResponse>(
      `${doctorEndpoints.me.facility}/attributes`,
      { attributes },
      { locale: 'ar' },
    ),

  listTypes: () =>
    get<FacilityTypesResponse>(doctorEndpoints.facilities.types, {
      locale: 'ar',
    }),
};
