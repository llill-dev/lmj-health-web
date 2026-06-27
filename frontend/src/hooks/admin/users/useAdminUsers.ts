import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type { CreateAdminUserBody } from '@/lib/admin/types';

const ADMIN_USERS_KEY = ['admin', 'users'] as const;
const STALE = 60 * 1000;

export function useAdminUsers() {
  const query = useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: () => adminApi.users.list(),
    staleTime: STALE,
  });

  return {
    ...query,
    users: query.data?.users ?? [],
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminUserBody) => adminApi.users.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

