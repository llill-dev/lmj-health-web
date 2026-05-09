'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminLookupsListParams } from '@/lib/admin/types';

export function useAdminLookups(params: AdminLookupsListParams) {
  return useQuery({
    queryKey: ['admin-lookups', params],
    queryFn: () => adminApi.lookups.list(params),
    staleTime: 30_000,
  });
}
