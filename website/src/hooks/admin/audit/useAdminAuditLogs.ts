import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import {
  isAwaitingInitialQueryData,
  isAwaitingInitialQueryDataWithPlaceholder,
} from '@/lib/query/queryUi';
import type { AuditLogsListParams } from '@/lib/admin/types';

export const AUDIT_LOGS_KEYS = {
  all: ['admin', 'audit-logs'] as const,
  list: (params: AuditLogsListParams) =>
    [...AUDIT_LOGS_KEYS.all, 'list', params] as const,
};

export function useAdminAuditLogs(params: AuditLogsListParams = {}) {
  const query = useQuery({
    queryKey: AUDIT_LOGS_KEYS.list(params),
    queryFn: () => adminApi.auditLogs.list(params),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryDataWithPlaceholder(
      query.data,
      query.isError,
      undefined,
    ),
  };
}
