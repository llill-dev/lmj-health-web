import { get, patch, post, put } from '@/lib/api';
import { doctorEndpoints } from '@/lib/doctor/endpoints';
import {
  parseDoctorFacilityRecordFromResponse,
  serializeDoctorFacilityMutationBody,
} from '@/lib/doctor/facilities/mappers';
import type {
  DoctorFacilityAssignBody,
  DoctorFacilityMutationBody,
  DoctorFacilityRecord,
  DoctorFacilityResponse,
  DoctorFacilitySuggestRequestBody,
  DoctorFacilitySuggestRequestResponse,
  FacilityTypeOption,
  FacilityTypesResponse,
} from '@/lib/doctor/facilities/api-types';

type FacilityTypesEnvelope = {
  types?: unknown;
  items?: unknown;
  data?: unknown;
  result?: unknown;
};

function asFacilityTypesEnvelope(value: unknown): FacilityTypesEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as FacilityTypesEnvelope)
    : null;
}

function isFacilityTypeOptionArray(value: unknown): value is FacilityTypeOption[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  );
}

function readFacilityTypeOptionArray(value: unknown): FacilityTypeOption[] | null {
  return isFacilityTypeOptionArray(value) ? value : null;
}

function readFacilityTypeOptions(value: unknown): FacilityTypeOption[] | null {
  const record = asFacilityTypesEnvelope(value);
  if (!record) return null;

  return (
    readFacilityTypeOptionArray(record.types) ??
    readFacilityTypeOptionArray(record.items) ??
    readFacilityTypeOptionArray(record.data) ??
    readFacilityTypeOptions(record.data) ??
    readFacilityTypeOptions(record.result)
  );
}

function normalizeDoctorFacilityResponse(
  response: DoctorFacilityResponse,
): DoctorFacilityResponse {
  const facility = parseDoctorFacilityRecordFromResponse(response);
  if (!facility) return response;

  return {
    ...response,
    facility,
    data: response.data ?? facility,
  };
}

function normalizeFacilityTypesResponse(
  response: FacilityTypesResponse,
): FacilityTypesResponse {
  return {
    ...response,
    types: readFacilityTypeOptions(response) ?? [],
  };
}

export const doctorFacilityApi = {
  get: () =>
    get<DoctorFacilityResponse>(doctorEndpoints.me.facility, { locale: 'ar' }).then(
      normalizeDoctorFacilityResponse,
    ),

  create: (body: DoctorFacilityMutationBody) =>
    post<DoctorFacilityResponse>(
      doctorEndpoints.me.facility,
      serializeDoctorFacilityMutationBody(body),
      { locale: 'ar' },
    ).then(normalizeDoctorFacilityResponse),

  update: (body: DoctorFacilityMutationBody) =>
    put<DoctorFacilityResponse>(
      doctorEndpoints.me.facility,
      serializeDoctorFacilityMutationBody(body),
      { locale: 'ar' },
    ).then(normalizeDoctorFacilityResponse),

  updateAttributes: (attributes: string[]) =>
    patch<DoctorFacilityResponse>(
      `${doctorEndpoints.me.facility}/attributes`,
      { attributes },
      { locale: 'ar' },
    ).then(normalizeDoctorFacilityResponse),

  /** PATCH /api/doctors/me/facility — link doctor to an existing catalog facility. */
  assign: (body: DoctorFacilityAssignBody) =>
    patch<DoctorFacilityResponse>(doctorEndpoints.me.facility, body, {
      locale: 'ar',
    }).then(normalizeDoctorFacilityResponse),

  requestAddition: (body: DoctorFacilitySuggestRequestBody) =>
    post<DoctorFacilitySuggestRequestResponse>(
      doctorEndpoints.facilities.requests,
      body,
      { locale: 'ar' },
    ),

  listTypes: () =>
    get<FacilityTypesResponse>(doctorEndpoints.facilities.types, {
      locale: 'ar',
    }).then(normalizeFacilityTypesResponse),
};
