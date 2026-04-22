import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import type { NotificationItem, NotificationsListResponse } from '@/lib/notifications/client';
import { notificationItemId, notificationsApi } from '@/lib/notifications/client';
import { ADMIN_NOTIFICATIONS_MOCK } from '@/components/admin/notifications/admin-notifications-mock';

const PAGE_SIZE = 20;

const UI_ONLY = import.meta.env.VITE_UI_ONLY === 'true';

function mockRowsToApiItems(): NotificationItem[] {
  return ADMIN_NOTIFICATIONS_MOCK.map((r) => ({
    _id: r.id,
    title: r.title,
    body: r.description,
    isRead: !r.isUnread,
    type: r.kind,
    createdAt: new Date(
      Date.now() - (r.id.charCodeAt(1) % 6) * 3_600_000,
    ).toISOString(),
  }));
}

function uiOnlyListResponse(
  page: number,
  limit: number,
  unread_only: boolean,
): NotificationsListResponse {
  let items = mockRowsToApiItems();
  if (unread_only) items = items.filter((n) => !n.isRead);
  const total = items.length;
  const start = (page - 1) * limit;
  const notifications = items.slice(start, start + limit);
  return { total, page, limit, notifications };
}

async function fetchList(
  page: number,
  limit: number,
  unread_only: boolean,
): Promise<NotificationsListResponse> {
  if (UI_ONLY) {
    return uiOnlyListResponse(page, limit, unread_only);
  }
  const res = await notificationsApi.list({ page, limit, unread_only });
  if (res == null) {
    return uiOnlyListResponse(page, limit, unread_only);
  }
  return res;
}

async function fetchUnreadTotal(): Promise<number> {
  if (UI_ONLY) {
    return uiOnlyListResponse(1, 1, true).total ?? 0;
  }
  const res = await notificationsApi.list({
    page: 1,
    limit: 1,
    unread_only: true,
  });
  if (res == null) {
    return uiOnlyListResponse(1, 1, true).total ?? 0;
  }
  return res.total ?? 0;
}

async function fetchAllTotal(): Promise<number> {
  if (UI_ONLY) {
    return uiOnlyListResponse(1, 1, false).total ?? 0;
  }
  const res = await notificationsApi.list({ page: 1, limit: 1 });
  if (res == null) {
    return uiOnlyListResponse(1, 1, false).total ?? 0;
  }
  return res.total ?? 0;
}

export const adminNotificationsQueryKeys = {
  list: (page: number, unreadOnly: boolean) =>
    ['admin', 'notifications', 'list', page, PAGE_SIZE, unreadOnly] as const,
  unreadTotal: ['admin', 'notifications', 'meta', 'unread-total'] as const,
  allTotal: ['admin', 'notifications', 'meta', 'all-total'] as const,
};

const listPredicate = (q: { queryKey: unknown }) =>
  Array.isArray(q.queryKey) &&
  q.queryKey[0] === 'admin' &&
  q.queryKey[1] === 'notifications' &&
  q.queryKey[2] === 'list';

function applyReadOneToCache(queryClient: QueryClient, id: string) {
  let wasUnread = false;
  queryClient.setQueriesData(
    { predicate: listPredicate },
    (old: NotificationsListResponse | undefined) => {
      if (!old?.notifications) return old;
      const next = old.notifications.map((n) => {
        if (notificationItemId(n) !== id) return n;
        if (n.isRead !== true) wasUnread = true;
        return { ...n, isRead: true };
      });
      return { ...old, notifications: next };
    },
  );
  if (wasUnread) {
    queryClient.setQueryData(
      adminNotificationsQueryKeys.unreadTotal,
      (n: number | undefined) => Math.max(0, (n ?? 0) - 1),
    );
  }
}

function applyReadAllToCache(queryClient: QueryClient) {
  queryClient.setQueriesData(
    { predicate: listPredicate },
    (old: NotificationsListResponse | undefined) => {
      if (!old?.notifications) return old;
      return {
        ...old,
        notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
      };
    },
  );
  queryClient.setQueryData(adminNotificationsQueryKeys.unreadTotal, 0);
}

export function useAdminNotificationsPage(filterUnread: boolean, page: number) {
  const queryClient = useQueryClient();
  const unreadOnly = filterUnread;

  const listQuery = useQuery({
    queryKey: adminNotificationsQueryKeys.list(page, unreadOnly),
    queryFn: () => fetchList(page, PAGE_SIZE, unreadOnly),
    staleTime: 15_000,
  });

  const unreadTotalQuery = useQuery({
    queryKey: adminNotificationsQueryKeys.unreadTotal,
    queryFn: fetchUnreadTotal,
    staleTime: 15_000,
  });

  const allTotalQuery = useQuery({
    queryKey: adminNotificationsQueryKeys.allTotal,
    queryFn: fetchAllTotal,
    staleTime: 15_000,
  });

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!UI_ONLY) {
        await notificationsApi.readOne(id);
      }
    },
    onSuccess: (_, id) => {
      if (UI_ONLY) applyReadOneToCache(queryClient, id);
      else void invalidateAll();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!UI_ONLY) {
        await notificationsApi.readAll();
      }
    },
    onSuccess: () => {
      if (UI_ONLY) applyReadAllToCache(queryClient);
      else void invalidateAll();
    },
  });

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);

  return {
    listQuery,
    unreadTotal: unreadTotalQuery.data ?? 0,
    allTotal: allTotalQuery.data ?? 0,
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    markOneReadMutation,
    markAllReadMutation,
    refetch: listQuery.refetch,
  };
}
