'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorSecretariesApi,
  doctorSecretariesQueryKeys,
} from '@/lib/doctor/secretaries/client';
import type {
  CreateDoctorSecretaryBody,
  UpdateDoctorSecretaryBody,
} from '@/lib/doctor/secretaries/types';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

const STALE_MS = 1000 * 30;

export function useDoctorSecretaries() {
  const query = useQuery({
    queryKey: doctorSecretariesQueryKeys.list(),
    queryFn: () => doctorSecretariesApi.list(),
    staleTime: STALE_MS,
  });

  const secretaries = query.data?.secretaries ?? [];
  const total = query.data?.total ?? secretaries.length;

  return {
    ...query,
    secretaries,
    total,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateDoctorSecretary() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateDoctorSecretaryBody) =>
      doctorSecretariesApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorSecretariesQueryKeys.all,
      });
    },
  });
}

export function useUpdateDoctorSecretary() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (input: {
      secretaryId: string;
      body: UpdateDoctorSecretaryBody;
    }) => doctorSecretariesApi.update(input.secretaryId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorSecretariesQueryKeys.all,
      });
    },
  });
}

export function useUnassignDoctorSecretary() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (secretaryId: string) =>
      doctorSecretariesApi.unassign(secretaryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorSecretariesQueryKeys.all,
      });
    },
  });
}
