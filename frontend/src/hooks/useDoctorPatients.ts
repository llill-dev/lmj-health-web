'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorApi,
  doctorPatientsQueryKeys,
} from '@/lib/doctor/client';
import type {
  CreateTemporaryPatientBody,
  DoctorPatientAccessRequestBody,
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
  };
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
