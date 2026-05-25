'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/notifications/client';

export function useDoctorNotificationsPage(
  unreadOnly: boolean,
  page = 1,
  limit = 20,
) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['doctor', 'notifications', { unreadOnly, page, limit }],
    queryFn: () =>
      notificationsApi.list({ page, limit, unread_only: unreadOnly }),
    staleTime: 1000 * 30,
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.readOne(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctor', 'notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctor', 'notifications'] });
    },
  });

  const total = listQuery.data?.total ?? 0;
  const limitUsed = listQuery.data?.limit ?? limit;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limitUsed)));

  return {
    listQuery,
    markOneReadMutation,
    markAllReadMutation,
    total,
    totalPages,
    unreadTotal: unreadOnly ? total : undefined,
  };
}
