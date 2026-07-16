'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useAdminAccessRequests(params: { page?: number; limit?: number; status?: string } = {}) {
  const query = useQuery({
    queryKey: ['admin-access-requests', params],
    queryFn: () => adminApi.accessRequests.list(params),
    staleTime: 1000 * 30,
  });

  return {
    requests: query.data?.requests ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 10,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminAccessRequestDetails(requestId: string | null) {
  const query = useQuery({
    queryKey: ['admin-access-request-details', requestId],
    queryFn: () => adminApi.accessRequests.getById(requestId!),
    enabled: !!requestId,
    staleTime: 1000 * 60,
  });

  return {
    request: query.data,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}
