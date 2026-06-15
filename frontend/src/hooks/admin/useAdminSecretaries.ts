import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import type { AdminSecretariesListParams } from '@/lib/admin/types';

export { useAdminOffboardUser } from '@/hooks/admin/useAdminOffboardUser';

const STALE = 5 * 60 * 1000;
const LIST_KEY = ['admin', 'secretaries'];

export function useAdminSecretariesList(params: AdminSecretariesListParams = {}) {
  const query = useQuery({
    queryKey: [...LIST_KEY, params],
    queryFn: () => adminApi.secretaries.list(params),
    staleTime: STALE,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}
