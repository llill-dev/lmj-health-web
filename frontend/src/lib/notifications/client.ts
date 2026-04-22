import { get, patch } from '@/lib/base';
import type { ApiSuccessEnvelope } from '@/lib/admin/types';

/**
 * عقد REST للإشعارات (المرجع في المشروع: API-3.pdf):
 *
 * - GET `/api/notifications` — استعلام مع `page`, `limit`, `unread_only` (اختياري).
 *   رد ناجح يتضمن عادةً: `total`, `page`, `limit`, `notifications[]`.
 * - PATCH `/api/notifications/read-all` — تعليم كل الإشعارات كمقروءة.
 * - PATCH `/api/notifications/:id/read` — تعليم إشعار واحد كمقروء.
 *
 * عناصر `notifications[]` تُستخرج كحقول اختيارية إضافية إن أرسلها الخادم (`type`, `createdAt`, …).
 */
export type NotificationsListParams = {
  page?: number;
  limit?: number;
  unread_only?: boolean;
};

export type NotificationItem = {
  _id?: string;
  id?: string;
  title?: string;
  body?: string;
  isRead?: boolean;
  /** نوع منطقي للإشعار إن وُجد (نص حر من الخادم) */
  type?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function notificationItemId(item: NotificationItem): string | undefined {
  const raw = item._id ?? item.id;
  if (raw == null || String(raw) === '') return undefined;
  return String(raw);
}

export type NotificationsListResponse = ApiSuccessEnvelope & {
  page?: number;
  limit?: number;
  total?: number;
  notifications?: NotificationItem[];
};

export type NotificationsReadAllResponse = ApiSuccessEnvelope & {
  message?: string;
  updated?: number;
};

export const notificationsApi = {
  list: (params: NotificationsListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page != null) qs.set('page', String(params.page));
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.unread_only === true) qs.set('unread_only', 'true');
    const suffix = qs.toString();
    return get<NotificationsListResponse>(
      suffix ? `/api/notifications?${suffix}` : '/api/notifications',
      { locale: 'ar' },
    );
  },

  /** PATCH /notifications/read-all — API-3.pdf */
  readAll: () =>
    patch<NotificationsReadAllResponse>(
      '/api/notifications/read-all',
      {},
      { locale: 'ar' },
    ),

  /** PATCH /notifications/:id/read — API-3.pdf */
  readOne: (id: string) =>
    patch<NotificationsReadAllResponse>(
      `/api/notifications/${id}/read`,
      {},
      { locale: 'ar' },
    ),
};
