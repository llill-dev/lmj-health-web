'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorProfileApi,
  type DoctorProfilePatchInput,
} from '@/lib/doctor/profileClient';
import {
  doctorProfileChangeRequestsApi,
  type DoctorProfileChangeRequestInput,
} from '@/lib/doctor/profileChangeRequestsClient';
import { syncAuthUserFromDoctorProfile } from '@/lib/doctor/syncAuthUserFromDoctorProfile';

export function useDoctorProfile() {
  return useQuery({
    queryKey: ['doctor', 'me', 'profile'],
    queryFn: () => doctorProfileApi.getProfile(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorProfilePatchInput) =>
      doctorProfileApi.patchProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(['doctor', 'me', 'profile'], data);
      syncAuthUserFromDoctorProfile(data);
      void queryClient.invalidateQueries({ queryKey: ['doctor', 'me', 'profile'] });
    },
  });
}

export function useDoctorProfileChangeRequests(status?: string) {
  return useQuery({
    queryKey: ['doctor', 'me', 'profile-change-requests', status ?? 'all'],
    queryFn: () =>
      doctorProfileChangeRequestsApi.list(
        status ? { status, limit: 20 } : { limit: 20 },
      ),
    staleTime: 1000 * 30,
  });
}

export function useSubmitDoctorProfileChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorProfileChangeRequestInput) =>
      doctorProfileChangeRequestsApi.submit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['doctor', 'me', 'profile-change-requests'],
      });
    },
  });
}
