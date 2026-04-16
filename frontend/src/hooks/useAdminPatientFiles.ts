'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminPatientFilesListParams } from '@/lib/admin/types';

export function useAdminPatientFiles(
  patientId?: string,
  params: AdminPatientFilesListParams = {},
) {
  const query = useQuery({
    queryKey: ['admin-patient-files', patientId, params],
    queryFn: () => adminApi.patients.files.list(patientId as string, params),
    enabled: Boolean(patientId),
    staleTime: 1000 * 30,
  });

  return {
    files: query.data?.items ?? [],
    pageInfo: query.data?.pageInfo,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
