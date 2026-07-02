'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/notifications/client';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

const PAGE_SIZE = 20;

/** مفاتيح الاستعلام الخاصة بإشعارات الطبيب */
export const doctorNotificationsQueryKeys = {
  list: (page: number, unreadOnly: boolean) =>
    ['doctor', 'notifications', 'list', page, PAGE_SIZE, unreadOnly] as const,
  unreadTotal: ['doctor', 'notifications', 'meta', 'unread-total'] as const,
  allTotal: ['doctor', 'notifications', 'meta', 'all-total'] as const,
};

/** جلب إجمالي الإشعارات غير المقروءة فقط */
async function fetchUnreadTotal(): Promise<number> {
  const res = await notificationsApi.list({
    page: 1,
    limit: 1,
    unread_only: true,
  });
  return res?.total ?? 0;
}

/** شارة الهيدر: إجمالي غير المقروء — نفس مفاتيح صفحة الإشعارات (GET /api/notifications، API-3). */
export function useDoctorUnreadNotificationCount() {
  const query = useQuery({
    queryKey: doctorNotificationsQueryKeys.unreadTotal,
    queryFn: fetchUnreadTotal,
    staleTime: 15_000,
    refetchInterval: 30_000, // Poll every 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

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
