import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AdminSecretariesListParams } from '@/lib/admin/types';

const STALE = 5 * 60 * 1000;
const LIST_KEY = ['admin', 'secretaries'];

export function useAdminSecretariesList(params: AdminSecretariesListParams = {}) {
  return useQuery({
    queryKey: [...LIST_KEY, params],
    queryFn: () => adminApi.secretaries.list(params),
    staleTime: STALE,
  });
}

export function useAdminOffboardUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.users.offboard(userId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
