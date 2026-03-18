import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  MessageSquare,
  Trash2,
  UserPlus,
  Check,
  XCircleIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type NotificationType =
  | 'appointment'
  | 'message'
  | 'access-request'
  | 'reminder'
  | 'cancel'
  | 'record';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timeLabel: string;
  isUnread: boolean;
  isNew: boolean;
};

const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'appointment',
    title: 'موعد جديد',
    description:
      'قام المريض محمد أحمد السعيد بحجز موعد جديد ليوم الأحد الساعة 09:00',
    timeLabel: 'منذ 10 دقيقة',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n2',
    type: 'message',
    title: 'رسالة جديدة',
    description: 'أرسلت المريضة فاطمة خالد رسالة جديدة في نظام الاستشارات',
    timeLabel: 'منذ 30 دقيقة',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n3',
    type: 'access-request',
    title: 'طلب وصول جديد',
    description:
      'يطلب الدكتور أحمد بن علي الوصول إلى السجل الطبي للمريض عبدالله سعد',
    timeLabel: 'منذ 2 ساعة',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'تذكير بموعد',
    description: 'لديك موعد مع المريض خالد محمد بعد ساعة واحدة',
    timeLabel: 'منذ 3 ساعة',
    isUnread: false,
    isNew: false,
  },
  {
    id: 'n5',
    type: 'cancel',
    title: 'إلغاء موعد',
    description:
      'قامت المريضة نورة عبد الله بإلغاء موعدها المجدول ليوم الإثنين',
    timeLabel: 'منذ 5 ساعة',
    isUnread: false,
    isNew: false,
  },
  {
    id: 'n6',
    type: 'record',
    title: 'تحديث سجل طبي',
    description: 'تم تحديث السجل الطبي للمريض سعد عبد الرحمن',
    timeLabel: 'أمس',
    isUnread: false,
    isNew: false,
  },
];

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
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useMemo(
    () => items.filter((n) => n.isUnread).length,
    [items],
  );

  const newCount = useMemo(() => items.filter((n) => n.isNew).length, [items]);

  const visibleItems = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => n.isUnread);
    return items;
  }, [items, filter]);

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((n) => ({ ...n, isUnread: false, isNew: false })),
    );
  };

  const markRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isUnread: false, isNew: false } : n,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <Helmet>
        <title>Notifications • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        <section className='rounded-[6px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-start justify-between'>
            <div className='flex flex-col gap-1 text-right'>
              <h1 className='font-cairo text-[22px] font-black leading-[28px] text-[#111827]'>
                الإشعارات
              </h1>
              <p className='font-cairo text-[13px] font-semibold text-[#98A2B3]'>
                لديك {newCount} إشعار جديد
              </p>
            </div>

            <div className='flex flex-col items-end gap-3'>
              <div className='inline-flex h-[34px] items-center justify-center rounded-[6px] bg-primary px-3 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15, 143, 139,0.25)]'>
                {newCount} جديد
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={markAllRead}
                  className='flex h-[34px] items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
                >
                  <Check className='h-4 w-4 text-primary' />
                  تحديد الكل كمقروء
                </button>

                <button
                  type='button'
                  onClick={() =>
                    setFilter((v) => (v === 'all' ? 'unread' : 'all'))
                  }
                  className='flex h-[34px] items-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
                >
                  <Bell className='h-4 w-4 text-[#667085]' />
                  غير مقروءة ({unreadCount})
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 space-y-4'>
          {visibleItems.map((n) => {
            const isAccent = n.isUnread;

            return (
              <div
                key={n.id}
                className={
                  isAccent
                    ? 'rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_26px_rgba(0,0,0,0.06)] border-l-[4.7px] border-l-[#0F8F8B]'
                    : 'rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_26px_rgba(0,0,0,0.06)] border-l-[4.7px] border-l-[#f0a95d]'
                }
              >
                <div className='flex h-[151px] items-stretch justify-between gap-4 px-5 py-4'>
                  <div className='flex flex-1 items-start justify-between gap-4'>
                    <div className='flex items-center justify-center  bg-[#FFFFFF] w-12 h-12 rounded-[6px] shadow-[0px_4px_6px_-1px_#0000001A]'>
                      {getTypeIcon(n.type)}
                    </div>
                    <div className='flex flex-1 flex-col text-right'>
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
                    <div className='flex items-start gap-3'>
                      {n.isNew ? (
                        <div className='inline-flex h-[22px] items-center justify-center rounded-[6px] bg-primary px-2 font-cairo text-[12px] font-semibold text-white'>
                          جديد
                        </div>
                      ) : (
                        <div className='h-[26px] w-[52px]' />
                      )}

                      {n.isUnread ? (
                        <button
                          type='button'
                          onClick={() => markRead(n.id)}
                          className='flex h-[34px] w-[34px] items-center justify-center rounded-[6px] border border-[#D1FAE5] bg-white text-[#16A34A] hover:bg-[#ECFDF3]'
                          aria-label='تحديد كمقروء'
                        >
                          <Check className='h-4 w-4' />
                        </button>
                      ) : (
                        <div className='h-[34px] w-[34px]' />
                      )}
                      <button
                        type='button'
                        onClick={() => removeItem(n.id)}
                        className='flex h-[34px] w-[34px] items-center justify-center rounded-[6px] border border-[#FEE2E2] bg-white text-[#F43F5E] hover:bg-[#FFF1F2]'
                        aria-label='حذف'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
