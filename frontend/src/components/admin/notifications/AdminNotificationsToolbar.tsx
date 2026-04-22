import { CheckCheck, Clock, ListFilter, Loader2 } from 'lucide-react';

export type NotificationFilterTab = 'all' | 'unread';

export default function AdminNotificationsToolbar({
  filter,
  onFilterChange,
  totalCount,
  unreadCount,
  onMarkAllRead,
  markAllPending,
  hasUnreadInView,
}: {
  filter: NotificationFilterTab;
  onFilterChange: (v: NotificationFilterTab) => void;
  totalCount: number;
  unreadCount: number;
  onMarkAllRead: () => void;
  markAllPending?: boolean;
  /** إن ظهرت بطاقات غير مقروءة في الصفحة الحالية رغم اختلاف العدد من الـ API */
  hasUnreadInView?: boolean;
}) {
  return (
    <div
      dir='rtl'
      className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
    >
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => onFilterChange('all')}
          className={
            filter === 'all'
              ? 'inline-flex h-[40px] items-center gap-2 rounded-[8px] bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]'
              : 'inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[13px] font-bold text-[#344054] transition hover:bg-[#F9FAFB]'
          }
        >
          <ListFilter className='h-4 w-4 opacity-90' aria-hidden />
          الكل ({totalCount})
        </button>
        <button
          type='button'
          onClick={() => onFilterChange('unread')}
          className={
            filter === 'unread'
              ? 'inline-flex h-[40px] items-center gap-2 rounded-[8px] bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]'
              : 'inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[13px] font-bold text-[#344054] transition hover:bg-[#F9FAFB]'
          }
        >
          <Clock className='h-4 w-4 opacity-90' aria-hidden />
          غير مقروءة ({unreadCount})
        </button>
      </div>

      <button
        type='button'
        disabled={
          markAllPending ||
          (unreadCount === 0 && !hasUnreadInView)
        }
        onClick={onMarkAllRead}
        className='inline-flex h-[40px] items-center justify-center gap-2 rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[13px] font-extrabold text-[#344054] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50'
      >
        {markAllPending ? (
          <Loader2
            className='h-4 w-4 animate-spin text-primary'
            aria-hidden
          />
        ) : (
          <CheckCheck className='h-4 w-4 text-primary' aria-hidden />
        )}
        تحديد الكل كمقروء
      </button>
    </div>
  );
}
