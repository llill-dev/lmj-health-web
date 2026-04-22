import AdminNotificationCard from './AdminNotificationCard';
import type { AdminNotificationRow } from './types';

export default function AdminNotificationsList({
  items,
  onToggleRead,
}: {
  items: AdminNotificationRow[];
  onToggleRead: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        dir='rtl'
        className='rounded-[12px] border border-dashed border-[#E8EDF2] bg-white/80 px-6 py-16 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]'
      >
        لا توجد إشعارات في هذا العرض.
      </div>
    );
  }

  return (
    <ul className='space-y-4'>
      {items.map((item) => (
        <li key={item.id}>
          <AdminNotificationCard
            item={item}
            onToggleRead={onToggleRead}
          />
        </li>
      ))}
    </ul>
  );
}
