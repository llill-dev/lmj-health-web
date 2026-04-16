import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import type { AuditLogsListParams } from '@/lib/admin/types';

export const AUDIT_LOGS_KEYS = {
  all: ['admin', 'audit-logs'] as const,
  list: (params: AuditLogsListParams) =>
    [...AUDIT_LOGS_KEYS.all, 'list', params] as const,
};

export function useAdminAuditLogs(params: AuditLogsListParams = {}) {
  return useQuery({
    queryKey: AUDIT_LOGS_KEYS.list(params),
    queryFn: () => adminApi.auditLogs.list(params),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}
