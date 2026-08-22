'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type { AdminLookupsListParams } from '@/lib/admin/types';

export function useAdminLookups(params: AdminLookupsListParams) {
  const query = useQuery({
    queryKey: ['admin-lookups', params],
    queryFn: () => adminApi.lookups.list(params),
    staleTime: 30_000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

/**
 * Blood Type has no admin CRUD and is never returned by `/admin/lookups`
 * (legacy `BLOOD_TYPE` lookup rows, if any exist, are explicitly documented
 * as ignored). This is the only correct source for the fixed enum.
 */
export function useHealthProfileOptions() {
  const query = useQuery({
    queryKey: ['admin-health-profile-options'],
    queryFn: () => adminApi.meta.getHealthProfileOptions(),
    staleTime: 5 * 60_000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}
