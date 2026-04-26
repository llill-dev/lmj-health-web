import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCheck, ChevronsLeft, ChevronsRight } from 'lucide-react';
import AdminNotificationsHeading from '@/components/admin/notifications/AdminNotificationsHeading';
import AdminNotificationsList from '@/components/admin/notifications/AdminNotificationsList';
import AdminNotificationsToolbar from '@/components/admin/notifications/AdminNotificationsToolbar';
import type { NotificationFilterTab } from '@/components/admin/notifications/AdminNotificationsToolbar';
import { mapNotificationsToRows } from '@/components/admin/notifications/map-api-to-rows';
import { useAdminNotificationsPage } from '@/hooks/useAdminNotifications';
import { ConfirmActionDialog } from '@/components/admin/dialogs';

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilterTab>('all');
  const [page, setPage] = useState(1);
  const [markAllOpen, setMarkAllOpen] = useState(false);
  const filterUnread = filter === 'unread';

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const {
    listQuery,
    unreadTotal,
    allTotal,
    total,
    totalPages,
    markOneReadMutation,
    markAllReadMutation,
  } = useAdminNotificationsPage(filterUnread, page);

  const rows = useMemo(
    () => mapNotificationsToRows(listQuery.data?.notifications),
    [listQuery.data?.notifications],
  );

  const hasUnreadInView = useMemo(
    () => rows.some((r) => r.isUnread),
    [rows],
  );

  const handleMarkRead = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row?.isUnread) return;
    markOneReadMutation.mutate(id);
  };

  const handleMarkAll = () => {
    if (unreadTotal === 0 && !hasUnreadInView) return;
    setMarkAllOpen(true);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pendingMarkId =
    markOneReadMutation.isPending &&
    typeof markOneReadMutation.variables === 'string'
      ? markOneReadMutation.variables
      : null;

  return (
    <>
      <Helmet>
        <title>الإشعارات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='space-y-6'
      >
        <AdminNotificationsHeading newCount={unreadTotal} />

        <div className='rounded-[14px] border border-[#EAECF0] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] md:p-6'>
          <AdminNotificationsToolbar
            filter={filter}
            onFilterChange={setFilter}
            totalCount={allTotal}
            unreadCount={unreadTotal}
            onMarkAllRead={handleMarkAll}
            markAllPending={markAllReadMutation.isPending}
            hasUnreadInView={hasUnreadInView}
          />
        </div>

        {listQuery.isError ? (
          <div
            role='alert'
            className='rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-right font-cairo text-[13px] font-semibold text-red-800'
          >
            تعذر تحميل الإشعارات.
            <button
              type='button'
              onClick={() => listQuery.refetch()}
              className='me-2 underline decoration-red-800 underline-offset-2'
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            <AdminNotificationsList
              items={rows}
              onMarkRead={handleMarkRead}
              pendingMarkId={pendingMarkId}
              isLoading={listQuery.isLoading}
            />

            <ConfirmActionDialog
              open={markAllOpen}
              onOpenChange={setMarkAllOpen}
              variant='primary'
              title='تأكيد تعليم كل الإشعارات كمقروء؟'
              icon={<CheckCheck className='h-6 w-6' strokeWidth={2} aria-hidden />}
              description='سيتم وضع علامة مقروء على جميع إشعاراتك غير المقروءة في النظام. يمكنك التراجع فقط بإدخال بيانات جديدة — لا يسترجع الزر حالة «غير مقروء» تلقائياً.'
              confirmLabel='تعليم الكل كمقروء'
              confirmDisabled={markAllReadMutation.isPending}
              onConfirm={async () => {
                await markAllReadMutation.mutateAsync();
              }}
            />

            {totalPages > 1 && !listQuery.isLoading ? (
              <div className='flex flex-wrap items-center justify-center gap-2'>
                <button
                  type='button'
                  disabled={!canPrev || listQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className='inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#475467] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <ChevronsRight className='h-4 w-4' aria-hidden />
                  السابق
                </button>
                <span className='font-cairo text-[12px] font-semibold text-[#64748B]'>
                  صفحة {page} من {totalPages} — إجمالي {total}
                </span>
                <button
                  type='button'
                  disabled={!canNext || listQuery.isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className='inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#475467] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  التالي
                  <ChevronsLeft className='h-4 w-4' aria-hidden />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
