'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { ApiError } from '@/lib/api';
import { doctorFacilityApi } from '@/lib/doctor/facilities/client';
import { medicalServicesDirectoryApi } from '@/lib/doctor/medical-services-directory/client';
import {
  formValuesToMutationBody,
  isPartialFacilityRecord,
  mapApiFacilityToDoctorFacility,
  mapSuggestRecordToLinkedDoctorFacility,
  parseDoctorFacilityRecordFromResponse,
} from '@/lib/doctor/facilities/mappers';
import {
  clearLinkedDoctorFacility,
  readLinkedDoctorFacility,
  storeLinkedDoctorFacility,
} from '@/lib/doctor/facilities/linkedFacilityStorage';
import type { SuggestFacilityRecord } from '@/lib/doctor/medical-services-directory/api-types';
import type { DoctorFacilityFormValues } from '@/lib/doctor/facilities/types';

export const DOCTOR_FACILITY_KEYS = {
  all: ['doctor', 'facility'] as const,
  detail: () => [...DOCTOR_FACILITY_KEYS.all, 'me'] as const,
  types: () => [...DOCTOR_FACILITY_KEYS.all, 'types'] as const,
  suggest: (q: string, city: string) =>
    [...DOCTOR_FACILITY_KEYS.all, 'suggest', q, city] as const,
};

async function resolveFacilityFromResponse(
  response: Awaited<ReturnType<typeof doctorFacilityApi.get>>,
) {
  const record = parseDoctorFacilityRecordFromResponse(response);
  if (record && !isPartialFacilityRecord(record)) {
    return mapApiFacilityToDoctorFacility(record, { isOwned: true });
  }

  const refreshed = await doctorFacilityApi.get();
  const refreshedRecord = parseDoctorFacilityRecordFromResponse(refreshed);
  if (!refreshedRecord) throw new Error('facility_record_null');
  return mapApiFacilityToDoctorFacility(refreshedRecord, { isOwned: true });
}

async function fetchDoctorFacility() {
  try {
    const response = await doctorFacilityApi.get();
    const record = parseDoctorFacilityRecordFromResponse(response);
    if (!record) return readLinkedDoctorFacility();
    clearLinkedDoctorFacility();
    return mapApiFacilityToDoctorFacility(record, { isOwned: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return readLinkedDoctorFacility();
    }
    throw error;
  }
}

async function persistFacility(
  mode: 'create' | 'edit',
  values: DoctorFacilityFormValues,
) {
  const body = formValuesToMutationBody(values);

  let response: Awaited<ReturnType<typeof doctorFacilityApi.create>>;

  if (mode === 'create') {
    response = await doctorFacilityApi.create(body);
  } else {
    response = await doctorFacilityApi.update(body);
    response = await doctorFacilityApi.updateAttributes(values.attributes ?? []);
  }

  const mapped = await resolveFacilityFromResponse(response);
  if (!mapped) {
    throw new Error('facility_response_invalid');
  }
  clearLinkedDoctorFacility();
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
    queryFn: fetchDoctorFacility,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      mode,
      values,
    }: {
      mode: 'create' | 'edit';
      values: DoctorFacilityFormValues;
    }) => persistFacility(mode, values),
    onSuccess: (facility) => {
      if (facility.isOwned !== false) {
        clearLinkedDoctorFacility();
      }
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

export function useFacilitySuggestSearch(
  query: string,
  city: string,
  enabled: boolean,
) {
  const normalizedQuery = query.trim();
  const normalizedCity = city.trim();

  return useQuery({
    queryKey: DOCTOR_FACILITY_KEYS.suggest(normalizedQuery, normalizedCity),
    queryFn: () =>
      medicalServicesDirectoryApi.suggest({
        q: normalizedQuery,
        city: normalizedCity || undefined,
        limit: 20,
      }),
    enabled: enabled && normalizedQuery.length >= 2,
    staleTime: 30_000,
  });
}

export function useLinkFacility() {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: ({
      facilityId,
      facilityProviderId,
    }: {
      facilityId: string;
      facilityProviderId: string;
      suggestSnapshot?: SuggestFacilityRecord;
    }) => doctorFacilityApi.assign({ facilityId, facilityProviderId }),
    onSuccess: (response, variables) => {
      const record = parseDoctorFacilityRecordFromResponse(response);
      let mapped = record
        ? mapApiFacilityToDoctorFacility(record, { isOwned: false })
        : null;

      if (!mapped && variables.suggestSnapshot) {
        mapped = mapSuggestRecordToLinkedDoctorFacility(
          variables.suggestSnapshot,
          variables.facilityId,
        );
      }

      if (!mapped) {
        void queryClient.invalidateQueries({
          queryKey: DOCTOR_FACILITY_KEYS.detail(),
        });
        return;
      }

      storeLinkedDoctorFacility(mapped);
      queryClient.setQueryData(DOCTOR_FACILITY_KEYS.detail(), mapped);
    },
  });

  return {
    linkMutation,
  };
}
