import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  UserPlus,
  Check,
  XCircleIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { DoctorNotificationListSkeleton } from '@/components/doctor/shared/skeletons';
import { mapNotificationsToRows } from '@/components/admin/notifications/map-api-to-rows';
import type { AdminNotificationKind } from '@/components/admin/notifications/types';
import { useDoctorNotificationsPage } from '@/hooks';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { useI18n } from '@/i18n/provider';

/**
 * The notifications API doesn't return a target resource id/link (no `targetId`,
 * `link`, `appointmentId`, etc. in `NotificationItem` — see lib/notifications/client.ts),
 * so we can't deep-link to the specific resource. We route to the relevant section
 * instead, using only the `kind` the row already carries — never inventing an id.
 */
function notificationKindTargetPath(kind: AdminNotificationKind): string {
  switch (kind) {
    case 'appointment':
    case 'reminder':
    case 'cancel':
      return '/doctor/appointments';
    case 'message':
      return '/doctor/online-consultations';
    case 'access-request':
      return '/doctor/access-requests';
    case 'record':
      return '/doctor/medical-records';
    default:
      return '/doctor/notification';
  }
}

type NotificationType = AdminNotificationKind;

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'appointment':
      return <CalendarDays className='h-[18px] w-[18px] text-primary' />;
    case 'message':
      return <MessageSquare className='h-[18px] w-[18px] text-primary' />;
    case 'access-request':
      return <UserPlus className='h-[18px] w-[18px] text-primary' />;
    case 'reminder':
      return <Clock className='h-[18px] w-[18px] text-[#F97316]' />;
    case 'cancel':
      return <XCircleIcon className='h-[18px] w-[18px] text-[#f92116]' />;
    case 'record':
      return <FileText className='h-[18px] w-[18px] text-[#2563EB]' />;
    default:
      return <Bell className='h-[18px] w-[18px] text-primary' />;
  }
}

export default function DoctorNotificationPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadOnly = filter === 'unread';

  const { listQuery, markOneReadMutation, markAllReadMutation } =
    useDoctorNotificationsPage(unreadOnly);

  const items = useMemo(
    () => mapNotificationsToRows(listQuery.data?.notifications),
    [listQuery.data?.notifications],
  );

  const unreadCount = useMemo(
    () => items.filter((n) => n.isUnread).length,
    [items],
  );

  const newCount = useMemo(() => items.filter((n) => n.isNew).length, [items]);

  const markAllRead = () => {
    if (!items.some((n) => n.isUnread)) return;
    markAllReadMutation.mutate();
  };

  const markRead = (id: string) => {
    const row = items.find((n) => n.id === id);
    if (!row?.isUnread) return;
    markOneReadMutation.mutate(id);
  };

  const pendingMarkId =
    markOneReadMutation.isPending &&
    typeof markOneReadMutation.variables === 'string'
      ? markOneReadMutation.variables
      : null;
  const isInitialLoading = isAwaitingInitialQueryData(
    listQuery.data,
    listQuery.isError,
  );

  return (
    <>
      <Helmet>
        <title>{tr('الإشعارات', 'Notifications')} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className='pb-8 sm:pb-10'
      >
        <section className='rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex flex-col gap-1 text-start'>
              <h1 className='font-cairo text-[22px] font-black leading-[28px] text-[#111827]'>
                {tr('الإشعارات', 'Notifications')}
              </h1>
              <p className='font-cairo text-[13px] font-semibold text-[#98A2B3]'>
                {tr(`لديك ${newCount} إشعار جديد`, `You have ${newCount} new notifications`)}
              </p>
            </div>

            <div className='flex flex-col items-stretch gap-3 sm:items-end'>
              <div className='inline-flex h-[34px] items-center justify-center rounded-[6px] bg-primary px-3 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15, 143, 139,0.25)]'>
                {tr(`${newCount} جديد`, `${newCount} new`)}
              </div>

              <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <button
                  type='button'
                  onClick={markAllRead}
                  disabled={
                    markAllReadMutation.isPending ||
                    !items.some((n) => n.isUnread)
                  }
                  className='flex h-[34px] items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-60'
                >
                  <Check className='h-4 w-4 text-primary' />
                  {tr('تحديد الكل كمقروء', 'Mark all as read')}
                </button>

                <button
                  type='button'
                  onClick={() =>
                    setFilter((v) => (v === 'all' ? 'unread' : 'all'))
                  }
                  className='flex h-[34px] items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
                >
                  <Bell className='h-4 w-4 text-[#667085]' />
                  {tr(`غير مقروءة (${unreadCount})`, `Unread (${unreadCount})`)}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 space-y-4'>
          {!isInitialLoading && listQuery.isRefetching ? (
            <div className='inline-flex items-center gap-2 rounded-[10px] border border-[#D5E8E6] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-primary'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {tr('جاري تحديث الإشعارات...', 'Refreshing notifications...')}
            </div>
          ) : null}
          {isInitialLoading ? (
            <DoctorNotificationListSkeleton rows={6} />
          ) : listQuery.isError ? (
            <div className='rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]'>
              <p>{tr('تعذّر تحميل الإشعارات. حاول تحديث الصفحة.', 'Failed to load notifications. Try refreshing the page.')}</p>
              <button
                type='button'
                onClick={() => void listQuery.refetch()}
                disabled={listQuery.isRefetching}
                className='mt-3 rounded-[8px] border border-[#FCA5A5] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {listQuery.isRefetching ? tr('جارٍ إعادة المحاولة...', 'Retrying...') : tr('إعادة المحاولة', 'Retry')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className='rounded-[14px] border border-[#E5E7EB] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              {filter === 'unread'
                ? tr('لا توجد إشعارات غير مقروءة.', 'No unread notifications.')
                : tr('لا توجد إشعارات حالياً.', 'No notifications right now.')}
            </div>
          ) : (
            items.map((n) => {
              const isAccent = n.isUnread;
              const marking = pendingMarkId === n.id;

              return (
                <div
                  key={n.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => {
                    if (n.isUnread) markRead(n.id);
                    navigate(notificationKindTargetPath(n.kind));
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    if (n.isUnread) markRead(n.id);
                    navigate(notificationKindTargetPath(n.kind));
                  }}
                  className={
                    (isAccent
                      ? 'rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_26px_rgba(0,0,0,0.06)] border-s-[4.7px] border-s-[#0F8F8B]'
                      : 'rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_26px_rgba(0,0,0,0.06)] border-s-[4.7px] border-s-[#f0a95d]') +
                    ' cursor-pointer transition hover:shadow-[0_16px_32px_rgba(0,0,0,0.09)]'
                  }
                >
                  <div className='flex min-h-[151px] flex-col gap-4 px-4 py-4 sm:px-5'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                      <div className='flex items-center justify-center  bg-[#FFFFFF] w-12 h-12 rounded-[6px] shadow-[0px_4px_6px_-1px_#0000001A]'>
                        {getTypeIcon(n.kind)}
                      </div>
                      <div className='flex flex-1 flex-col text-start'>
                        <div className='font-cairo text-[16px] font-extrabold leading-[22px] text-[#111827]'>
                          {n.title}
                        </div>
                        <div className='mt-1 font-cairo text-[12px] font-semibold leading-[18px] text-[#667085]'>
                          {n.description}
                        </div>

                        <div className='mt-2 flex items-center gap-2 text-[#98A2B3]'>
                          <Clock className='h-3.5 w-3.5' />
                          <span className='font-cairo text-[11px] font-semibold'>
                            {n.timeLabel}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center justify-between gap-3 sm:justify-start sm:self-start'>
                        {n.isNew ? (
                          <div className='inline-flex h-[22px] items-center justify-center rounded-[6px] bg-primary px-2 font-cairo text-[12px] font-semibold text-white'>
                            {tr('جديد', 'New')}
                          </div>
                        ) : (
                          <div className='h-[26px] w-[52px]' />
                        )}

                        {n.isUnread ? (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(n.id);
                            }}
                            disabled={marking}
                            className='flex h-[34px] w-[34px] items-center justify-center rounded-[6px] border border-[#D1FAE5] bg-white text-[#16A34A] hover:bg-[#ECFDF3] disabled:opacity-60'
                            aria-label={tr('تحديد كمقروء', 'Mark as read')}
                          >
                            {marking ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <Check className='h-4 w-4' />
                            )}
                          </button>
                        ) : (
                          <div className='h-[34px] w-[34px]' />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}
