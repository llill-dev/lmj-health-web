'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorAccessRequestsQueryKeys,
  doctorApi,
} from '@/lib/doctor/client';
import type { DoctorAccessRequestListParams } from '@/lib/doctor/types';

export function useDoctorAccessRequests(
  params: DoctorAccessRequestListParams = {},
) {
  const query = useQuery({
    queryKey: doctorAccessRequestsQueryKeys.list(params),
    queryFn: () => doctorApi.accessRequests.list(params),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    requests: query.data?.requests ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 20,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
  };
}

export function useDoctorAccessRequestDetails(requestId: string) {
  const query = useQuery({
    queryKey: doctorAccessRequestsQueryKeys.detail(requestId),
    queryFn: () => doctorApi.accessRequests.getById(requestId),
    enabled: Boolean(requestId),
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    request: query.data?.request,
  };
}

export function useDoctorApprovedAccessPayload(
  doctorId: string,
  patientId: string,
  requestId: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: doctorAccessRequestsQueryKeys.approvedPayload(
      doctorId,
      patientId,
      requestId,
    ),
    queryFn: () =>
      doctorApi.patients.getAccessRequestApprovedPayload(
        doctorId,
        patientId,
        requestId,
      ),
    enabled:
      enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(requestId),
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

export function useCreateDoctorAccessRequest(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      body,
    }: {
      patientId: string;
      body: Parameters<typeof doctorApi.patients.requestAccess>[2];
    }) => doctorApi.patients.requestAccess(doctorId, patientId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorAccessRequestsQueryKeys.all,
      });
    },
  });
}
