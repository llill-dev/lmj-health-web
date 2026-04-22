import type { AdminNotificationRow } from './types';

/** بيانات عرض مطابقة لنموذج الواجهة — يمكن لاحقاً استبدالها بـ GET /notifications */
export const ADMIN_NOTIFICATIONS_MOCK: AdminNotificationRow[] = [
  {
    id: 'n1',
    kind: 'appointment',
    title: 'موعد جديد',
    description:
      'قام المريض محمد أحمد السعيد بحجز موعد جديد ليوم الأحد الساعة 09:00',
    timeLabel: 'منذ 10 دقائق',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n2',
    kind: 'message',
    title: 'رسالة جديدة',
    description:
      'أرسلت المريضة فاطمة خالد رسالة جديدة في نظام الاستشارات',
    timeLabel: 'منذ 30 دقيقة',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n3',
    kind: 'access-request',
    title: 'طلب وصول جديد',
    description:
      'يطلب الدكتور أحمد بن علي الوصول إلى السجل الطبي للمريض عبدالله سعد',
    timeLabel: 'منذ ساعتين',
    isUnread: true,
    isNew: true,
  },
  {
    id: 'n4',
    kind: 'reminder',
    title: 'تذكير بموعد',
    description: 'لديك موعد مع المريض خالد محمد بعد ساعة واحدة',
    timeLabel: 'منذ 3 ساعات',
    isUnread: false,
    isNew: false,
  },
  {
    id: 'n5',
    kind: 'cancel',
    title: 'إلغاء موعد',
    description:
      'قامت المريضة نورة عبد الله بإلغاء موعدها المجدول ليوم الإثنين',
    timeLabel: 'منذ 5 ساعات',
    isUnread: false,
    isNew: false,
  },
  {
    id: 'n6',
    kind: 'record',
    title: 'تحديث سجل طبي',
    description: 'تم تحديث السجل الطبي للمريض سعد عبد الرحمن',
    timeLabel: 'أمس',
    isUnread: false,
    isNew: false,
  },
];
