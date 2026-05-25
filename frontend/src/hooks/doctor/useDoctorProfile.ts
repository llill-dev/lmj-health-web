'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorProfileApi,
  type DoctorProfilePatchInput,
} from '@/lib/doctor/profileClient';

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
      void queryClient.invalidateQueries({ queryKey: ['doctor', 'me', 'profile'] });
    },
  });
}
