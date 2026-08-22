'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type {
  AdminAppointmentsListParams,
  AdminAppointmentsListResponse,
} from '@/lib/admin/types';

export function useAdminAppointments(params: AdminAppointmentsListParams) {
  const query = useQuery<AdminAppointmentsListResponse>({
    queryKey: ['admin-appointments', params],
    queryFn: () => adminApi.appointments.list(params),
    staleTime: 1000 * 30,
  });

  return {
    appointments: query.data?.appointments ?? [],
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 10,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
