import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminNotificationsHeading from '@/components/admin/notifications/AdminNotificationsHeading';
import AdminNotificationsList from '@/components/admin/notifications/AdminNotificationsList';
import AdminNotificationsToolbar from '@/components/admin/notifications/AdminNotificationsToolbar';
import type { NotificationFilterTab } from '@/components/admin/notifications/AdminNotificationsToolbar';
import { ADMIN_NOTIFICATIONS_MOCK } from '@/components/admin/notifications/admin-notifications-mock';
import type { AdminNotificationRow } from '@/components/admin/notifications/types';

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotificationRow[]>(
    ADMIN_NOTIFICATIONS_MOCK,
  );
  const [filter, setFilter] = useState<NotificationFilterTab>('all');

  const newCount = useMemo(
    () => items.filter((n) => n.isNew && n.isUnread).length,
    [items],
  );

  const unreadCount = useMemo(
    () => items.filter((n) => n.isUnread).length,
    [items],
  );

  const visibleItems = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => n.isUnread);
    return items;
  }, [items, filter]);

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((n) => ({ ...n, isUnread: false, isNew: false })),
    );
  };

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const nextUnread = !n.isUnread;
        return {
          ...n,
          isUnread: nextUnread,
          isNew: nextUnread ? n.isNew : false,
        };
      }),
    );
  };

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
        <AdminNotificationsHeading newCount={newCount} />

        <div className='rounded-[14px] border border-[#EAECF0] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] md:p-6'>
          <AdminNotificationsToolbar
            filter={filter}
            onFilterChange={setFilter}
            totalCount={items.length}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
          />
        </div>

        <AdminNotificationsList
          items={visibleItems}
          onToggleRead={toggleRead}
        />
      </div>
    </>
  );
}
