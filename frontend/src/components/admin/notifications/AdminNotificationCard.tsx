import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  FileText,
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
  onToggleRead,
}: {
  item: AdminNotificationRow;
  onToggleRead: (id: string) => void;
}) {
  const stripe = stripeColor(item.kind);
  const iconWrap = iconBoxClass(item.kind);

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
              <span className='inline-flex gap-2 items-center rounded-[6px] bg-primary px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-white'>
                جديد
              </span>
            ) : null}
          </div>
          <p className='mt-1 font-cairo text-[13px] font-medium leading-[20px] text-[#667085]'>
            {item.description}
          </p>
          <div className='flex gap-1.5 justify-start items-center mt-3 text-[#98A2B3]'>
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
            onClick={() => onToggleRead(item.id)}
            className='w-8 h-8 flex justify-center items-center cursor-pointer rounded bg-[##F8FAFB] border-[1.82px] border-[##E5E7EB]'
            aria-label={item.isUnread ? 'تعليم كمقروء' : 'تعليم كغير مقروء'}
          >
            <Check className='w-4 h-4 font-bold text-primary' />
          </button>
        </div>
      </div>
    </article>
  );
}
