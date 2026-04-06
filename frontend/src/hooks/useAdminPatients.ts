'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminPatientsListParams,
  AdminPatientsListResponse,
} from '@/lib/admin/types';

export function useAdminPatients(params: AdminPatientsListParams) {
  const { data, isLoading, error, refetch } = useQuery<AdminPatientsListResponse>(
    {
      queryKey: ['admin-patients', params],
      queryFn: () => adminApi.patients.list(params),
      staleTime: 1000 * 30,
    },
  );

  return {
    patients: data?.patients ?? [],
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 20,
    total: data?.total ?? 0,
    results: data?.results ?? 0,
    isLoading,
    error,
    refetch,
  };
}
