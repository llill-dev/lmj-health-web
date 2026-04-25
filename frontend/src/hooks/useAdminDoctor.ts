'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { normalizeAdminDoctorDetailsResponse } from '@/lib/admin/normalizeAdminDoctorDetailsResponse';
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

  const n = useMemo(
    () => (data ? normalizeAdminDoctorDetailsResponse(data) : {}),
    [data],
  );

  return {
    doctor: n.doctor,
    verificationRequest: n.verificationRequest,
    pendingVerificationRequestId: n.pendingVerificationRequestId,
    isLoading,
    error,
    refetch,
  };
}
