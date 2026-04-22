'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminDoctorDetailsResponse } from '@/lib/admin/types';

export function useAdminDoctor(doctorId?: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminDoctorDetailsResponse>({
    queryKey: ['admin-doctor', doctorId],
    queryFn: () => adminApi.doctors.getById(String(doctorId)),
    enabled: Boolean(doctorId),
    staleTime: 1000 * 30,
  });

  return {
    doctor: data?.doctor,
    verificationRequest: data?.verificationRequest,
    isLoading,
    error,
    refetch,
  };
}
