'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import {
  doctorApi,
  doctorPatientsQueryKeys,
} from '@/lib/doctor/client';
import type {
  CreateTemporaryPatientBody,
  DoctorCloseEncounterResponse,
  DoctorCreateEncounterBody,
  DoctorEncounterDetailsResponse,
  DoctorPatientAccessRequestBody,
  DoctorPatientEncountersListParams,
  DoctorPatientsListParams,
} from '@/lib/doctor/types';

export function useDoctorPatients(params: DoctorPatientsListParams) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.list(params),
    queryFn: () => doctorApi.patients.list(params),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    patients: query.data?.patients ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 20,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorPatientPublicProfile(patientId: string, enabled = true) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
    queryFn: () => doctorApi.patients.getPublicProfile(patientId),
    enabled: enabled && Boolean(patientId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    patient: query.data?.patient,
    isAwaitingData:
      enabled &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorPatientFullProfile(
  doctorId: string,
  patientId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
    queryFn: () => doctorApi.patients.getFullProfileResult(doctorId, patientId),
    enabled: enabled && Boolean(doctorId) && Boolean(patientId),
    retry: false,
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    result: query.data,
    patient: query.data?.ok ? query.data.data.patient : undefined,
    deniedError:
      query.data && query.data.ok === false ? query.data.error : null,
    isAwaitingData:
      enabled &&
      Boolean(doctorId) &&
      Boolean(patientId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorPatientEncounters(
  doctorId: string,
  patientId: string,
  params: DoctorPatientEncountersListParams = {},
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.encounters(doctorId, patientId, params),
    queryFn: () => doctorApi.patients.listEncounters(doctorId, patientId, params),
    enabled: enabled && Boolean(doctorId) && Boolean(patientId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    encounters: query.data?.encounters ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 20,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
    isAwaitingData:
      enabled &&
      Boolean(doctorId) &&
      Boolean(patientId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorPatientEncounterDetail(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.encounterDetail(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () => doctorApi.patients.getEncounter(doctorId, patientId, encounterId),
    enabled:
      enabled &&
      Boolean(doctorId) &&
      Boolean(patientId) &&
      Boolean(encounterId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    encounter: query.data?.encounter,
    isAwaitingData:
      enabled &&
      Boolean(doctorId) &&
      Boolean(patientId) &&
      Boolean(encounterId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateDoctorPatientEncounter(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      body,
    }: {
      patientId: string;
      body: DoctorCreateEncounterBody;
    }) => doctorApi.patients.createEncounter(doctorId, patientId, body),
    onSuccess: (_response: DoctorEncounterDetailsResponse, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounters(doctorId, variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
    },
  });
}

export function useCloseDoctorPatientEncounter(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      encounterId,
    }: {
      patientId: string;
      encounterId: string;
    }) => doctorApi.patients.closeEncounter(doctorId, patientId, encounterId),
    onSuccess: (_response: DoctorCloseEncounterResponse, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounters(doctorId, variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterDetail(
          doctorId,
          variables.patientId,
          variables.encounterId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterSummary(
          doctorId,
          variables.patientId,
          variables.encounterId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
    },
  });
}

export function useCreateTemporaryDoctorPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTemporaryPatientBody) =>
      doctorApi.patients.createTemporary(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
    },
  });
}

export function useRequestDoctorPatientAccess(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      body,
    }: {
      patientId: string;
      body: DoctorPatientAccessRequestBody;
    }) => doctorApi.patients.requestAccess(doctorId, patientId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, variables.patientId),
      });
    },
  });
}

export function useLinkDoctorPatient(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      doctorApi.patients.linkPatient(doctorId, patientId),
    onSuccess: (_response, patientId) => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.publicProfile(patientId),
      });
    },
  });
}

export function useDoctorPatientFiles(patientId: string, enabled = true) {
  const query = useQuery({
    queryKey: doctorPatientsQueryKeys.files(patientId),
    queryFn: () => doctorApi.patients.listFiles(patientId),
    enabled: enabled && Boolean(patientId),
    staleTime: 1000 * 30,
  });

  const items = query.data?.items ?? query.data?.files ?? [];
  const pageInfo = query.data?.pageInfo;

  return {
    ...query,
    files: items,
    page: query.data?.page ?? pageInfo?.page ?? 1,
    limit: query.data?.limit ?? pageInfo?.limit ?? items.length,
    total: query.data?.total ?? pageInfo?.total ?? items.length,
    isAwaitingData:
      enabled &&
      Boolean(patientId) &&
      isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useUploadDoctorPatientFile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      note,
      tags,
    }: {
      file: File;
      note?: string;
      tags?: string[];
    }) => doctorApi.patients.uploadFile(patientId, file, note, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.files(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
    },
  });
}

export function useDeleteDoctorPatientFile(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => doctorApi.patients.deleteFile(patientId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.files(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.all,
      });
    },
  });
}
