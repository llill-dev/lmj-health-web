'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminDoctorsListParams,
  AdminDoctorsListResponse,
} from '@/lib/admin/types';

export function useAdminDoctors(params: AdminDoctorsListParams) {
  const query = useQuery<AdminDoctorsListResponse>({
    queryKey: ['admin-doctors', params],
    queryFn: () => adminApi.doctors.list(params),
    staleTime: 1000 * 30,
  });

  return {
    doctors: query.data?.doctors ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 20,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
