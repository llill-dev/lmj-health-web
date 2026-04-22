import { Loader2 } from 'lucide-react';
import AdminNotificationCard from './AdminNotificationCard';
import type { AdminNotificationRow } from './types';

export default function AdminNotificationsList({
  items,
  onMarkRead,
  pendingMarkId,
  isLoading,
}: {
  items: AdminNotificationRow[];
  onMarkRead: (id: string) => void;
  pendingMarkId?: string | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div
        dir='rtl'
        className='flex items-center justify-center gap-2 rounded-[12px] border border-[#E8EDF2] bg-white px-6 py-20 font-cairo text-[14px] font-semibold text-[#667085]'
      >
        <Loader2
          className='h-5 w-5 animate-spin text-primary'
          aria-hidden
        />
        جارِ تحميل الإشعارات...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section
        dir='rtl'
        lang='ar'
        className='flex min-h-[min(420px,70vh)] flex-col items-center justify-center rounded-[14px] border border-[#EAECF0] bg-white px-6 py-12 shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:px-10 sm:py-16'
        aria-label='لا توجد إشعارات'
      >
        <div className='flex w-full max-w-[420px] flex-col items-center justify-center'>
          <img
            src='/images/notfound_notfication.png'
            alt='لا يوجد إشعارات'
            width={400}
            height={400}
            loading='lazy'
            decoding='async'
            className='h-auto w-full max-w-[260px] object-contain sm:max-w-[300px] md:max-w-[340px]'
          />
        </div>
      </section>
    );
  }

  return (
    <ul className='space-y-4'>
      {items.map((item) => (
        <li key={item.id}>
          <AdminNotificationCard
            item={item}
            onMarkRead={onMarkRead}
            markReadPending={pendingMarkId === item.id}
          />
        </li>
      ))}
    </ul>
  );
}
