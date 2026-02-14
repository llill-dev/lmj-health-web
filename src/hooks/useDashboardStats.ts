'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type DashboardStats } from '@/lib/api/api';

export function useDashboardStats() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats: response?.data,
    isLoading,
    error,
    refetch,
  };
}
