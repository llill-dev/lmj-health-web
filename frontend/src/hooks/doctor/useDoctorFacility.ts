'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { ApiError } from '@/lib/api';
import { doctorFacilityApi } from '@/lib/doctor/facilities/client';
import {
  formValuesToCreateRequestBody,
  formValuesToMutationBody,
  isPartialFacilityRecord,
  mapApiFacilityToDoctorFacility,
  parseDoctorFacilityRecordFromResponse,
} from '@/lib/doctor/facilities/mappers';
import type { DoctorFacilityFormValues } from '@/lib/doctor/facilities/types';

export const DOCTOR_FACILITY_KEYS = {
  all: ['doctor', 'facility'] as const,
  detail: () => [...DOCTOR_FACILITY_KEYS.all, 'me'] as const,
  types: () => [...DOCTOR_FACILITY_KEYS.all, 'types'] as const,
};

async function resolveFacilityFromResponse(
  response: Awaited<ReturnType<typeof doctorFacilityApi.get>>,
) {
  const record = parseDoctorFacilityRecordFromResponse(response);
  if (record && !isPartialFacilityRecord(record)) {
    return mapApiFacilityToDoctorFacility(record);
  }

  const refreshed = await doctorFacilityApi.get();
  const refreshedRecord = parseDoctorFacilityRecordFromResponse(refreshed);
  if (!refreshedRecord) throw new Error('facility_record_null');
  return mapApiFacilityToDoctorFacility(refreshedRecord);
}

async function fetchOwnedFacility() {
  try {
    const response = await doctorFacilityApi.get();
    const record = parseDoctorFacilityRecordFromResponse(response);
    if (!record) return null;
    return mapApiFacilityToDoctorFacility(record);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function persistFacility(
  mode: 'create' | 'edit',
  values: DoctorFacilityFormValues,
  existingAttributes?: string[],
) {
  const body = formValuesToMutationBody(values, existingAttributes);

  let response: Awaited<ReturnType<typeof doctorFacilityApi.create>>;

  if (mode === 'create') {
    try {
      response = await doctorFacilityApi.create(body);
    } catch (error) {
      const shouldFallback =
        error instanceof ApiError &&
        (error.status >= 500 || error.messageKey === 'errors.unknown');
      if (!shouldFallback) throw error;
      response = await doctorFacilityApi.createRequest(
        formValuesToCreateRequestBody(values),
      );
    }
  } else {
    response = await doctorFacilityApi.update(body);
  }

  const mapped = await resolveFacilityFromResponse(response);
  if (!mapped) {
    throw new Error('facility_response_invalid');
  }
  return mapped;
}

export function useDoctorFacilityTypes() {
  return useQuery({
    queryKey: DOCTOR_FACILITY_KEYS.types(),
    queryFn: () => doctorFacilityApi.listTypes(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useDoctorFacility() {
  const queryClient = useQueryClient();

  const facilityQuery = useQuery({
    queryKey: DOCTOR_FACILITY_KEYS.detail(),
    queryFn: fetchOwnedFacility,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      mode,
      values,
      existingAttributes,
    }: {
      mode: 'create' | 'edit';
      values: DoctorFacilityFormValues;
      existingAttributes?: string[];
    }) => persistFacility(mode, values, existingAttributes),
    onSuccess: (facility) => {
      queryClient.setQueryData(DOCTOR_FACILITY_KEYS.detail(), facility);
    },
  });

  return {
    facility: facilityQuery.data,
    facilityQuery,
    saveMutation,
    isAwaitingData: isAwaitingInitialQueryData(
      facilityQuery.data,
      facilityQuery.isError,
    ),
  };
}

export function useSuggestFacility() {
  const queryClient = useQueryClient();

  const suggestMutation = useMutation({
    mutationFn: (body: Parameters<typeof doctorFacilityApi.createRequest>[0]) =>
      doctorFacilityApi.createRequest(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCTOR_FACILITY_KEYS.all });
    },
  });

  return {
    suggestMutation,
  };
}
