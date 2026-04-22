import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  UserPlus,
  XCircle,
} from 'lucide-react';
import type { AdminNotificationRow } from './types';
import { iconBoxClass, stripeColor } from './notification-style';

function KindIcon({ kind }: { kind: AdminNotificationRow['kind'] }) {
  const cls = 'h-[18px] w-[18px] shrink-0';
  switch (kind) {
    case 'appointment':
      return <CalendarDays className={cls} />;
    case 'message':
      return <MessageSquare className={cls} />;
    case 'access-request':
      return <UserPlus className={cls} />;
    case 'reminder':
      return <Clock className={cls} />;
    case 'cancel':
      return <XCircle className={cls} />;
    case 'record':
      return <FileText className={cls} />;
    default:
      return <Bell className={cls} />;
  }
}

export default function AdminNotificationCard({
  item,
  onMarkRead,
  markReadPending = false,
}: {
  item: AdminNotificationRow;
  onMarkRead: (id: string) => void;
  markReadPending?: boolean;
}) {
  const stripe = stripeColor(item.kind);
  const iconWrap = iconBoxClass(item.kind);
  const canMark = item.isUnread && !markReadPending;

  return (
    <article
      className='overflow-hidden rounded-[12px] border border-[#E8EDF2] border-l-4 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)]'
      style={{ borderLeftColor: stripe }}
    >
      <div
        dir='rtl'
        className='flex gap-4 items-start px-5 py-4 sm:gap-5'
      >
        <div
          className={`flex justify-center items-center w-12 h-12 shrink-0 rounded-[10px] ${iconWrap}`}
        >
          <KindIcon kind={item.kind} />
        </div>

        <div className='flex-1 min-w-0 text-right'>
          <div className='flex flex-wrap gap-2 justify-start items-center'>
            <h2 className='font-cairo text-[16px] font-extrabold leading-[22px] text-[#111827]'>
              {item.title}
            </h2>
            {item.isNew && item.isUnread ? (
              <span className='inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-white'>
                جديد
              </span>
            ) : null}
          </div>
          <p className='mt-1 font-cairo text-[13px] font-medium leading-[20px] text-[#667085]'>
            {item.description}
          </p>
          <div className='mt-3 flex items-center justify-start gap-1.5 text-[#98A2B3]'>
            <Clock
              className='h-3.5 w-3.5 shrink-0'
              aria-hidden
            />
            <span className='font-cairo text-[12px] font-semibold'>
              {item.timeLabel}
            </span>
          </div>
        </div>

        <div className='flex shrink-0 items-start pt-0.5'>
          <button
            type='button'
            disabled={!item.isUnread || markReadPending}
            onClick={() => onMarkRead(item.id)}
            className={
              item.isUnread
                ? 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFB] transition hover:border-primary/40 hover:bg-[#F2FFFE]'
                : 'flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] opacity-60'
            }
            aria-label='تعليم كمقروء'
          >
            {markReadPending ? (
              <Loader2
                className='w-4 h-4 animate-spin text-primary'
                aria-hidden
              />
            ) : (
              <Check
                className={`h-4 w-4 ${canMark || !item.isUnread ? 'text-primary' : 'text-[#98A2B3]'}`}
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
