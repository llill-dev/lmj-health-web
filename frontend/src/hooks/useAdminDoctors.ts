'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminDoctorsListParams,
  AdminDoctorsListResponse,
} from '@/lib/admin/types';

export function useAdminDoctors(params: AdminDoctorsListParams) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminDoctorsListResponse>({
    queryKey: ['admin-doctors', params],
    queryFn: () => adminApi.doctors.list(params),
    staleTime: 1000 * 30,
  });

  return {
    doctors: data?.doctors ?? [],
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 20,
    total: data?.total ?? 0,
    results: data?.results ?? 0,
    isLoading,
    error,
    refetch,
  };
}
