import { useQueries } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import type { AdminContentListResponse, AdminContentStatus } from '@/lib/admin/types';
import { resolvePagedTotal } from '@/components/admin/medical-content/contentListUtils';

const STAGES: ('all' | AdminContentStatus)[] = [
  'all',
  'PUBLISHED',
  'IN_REVIEW',
  'DRAFT',
  'ARCHIVED',
];

/**
 * أعداد تجميعية من السيرفر (GET list مع limit=1) — تبقى دقيقة مع الترقيم.
 */
export function useAdminContentStatusCounts() {
  const results = useQueries({
    queries: STAGES.map((key) => ({
      queryKey: ['admin', 'content', 'count', key],
      queryFn: () =>
        key === 'all'
          ? adminApi.content.list({ page: 1, limit: 1 })
          : adminApi.content.list({
              status: key,
              page: 1,
              limit: 1,
            }),
      select: (d: AdminContentListResponse) => resolvePagedTotal(d, 0),
      staleTime: 45_000,
    })),
  });

  const byKey = {
    all: (results[0]?.data as number | undefined) ?? 0,
    published: (results[1]?.data as number | undefined) ?? 0,
    inReview: (results[2]?.data as number | undefined) ?? 0,
    draft: (results[3]?.data as number | undefined) ?? 0,
    archived: (results[4]?.data as number | undefined) ?? 0,
  };

  return {
    ...byKey,
    isAwaitingData: isAwaitingAnyInitialQueryData(
      results.map((r) => ({ data: r.data, isError: r.isError })),
    ),
    isError: results.some((r) => r.isError),
  };
}
