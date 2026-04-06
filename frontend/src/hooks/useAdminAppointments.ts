'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type {
  AdminAppointmentsListParams,
  AdminAppointmentsListResponse,
} from '@/lib/admin/types';

export function useAdminAppointments(params: AdminAppointmentsListParams) {
  const { data, isLoading, error, refetch } = useQuery<
    AdminAppointmentsListResponse
  >({
    queryKey: ['admin-appointments', params],
    queryFn: () => adminApi.appointments.list(params),
    staleTime: 1000 * 30,
  });

  return {
    appointments: data?.appointments ?? [],
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 10,
    total: data?.total ?? 0,
    results: data?.results ?? 0,
    isLoading,
    error,
    refetch,
  };
}
