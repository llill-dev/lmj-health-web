import type { NotificationItem } from '@/lib/notifications/client';
import { notificationItemId } from '@/lib/notifications/client';
import type { AdminNotificationKind, AdminNotificationRow } from './types';

/**
 * يحدد إن كان الإشعار مقروءاً وفقاً لما قد يرسله الخادم (camelCase أو snake_case).
 * الافتراضي: غير مقروء إن لم تكن هناك إشارة صريحة للقراءة.
 */
export function normalizeNotificationRead(item: NotificationItem): boolean {
  if (item.isRead === true) return true;
  if (item.isRead === false) return false;
  if (item.read === true) return true;
  if (item.read === false) return false;
  if (item.is_read === true) return true;
  if (item.is_read === false) return false;

  const at = item.readAt ?? item.read_at;
  if (typeof at === 'string' && at.trim() !== '') return true;

  const st = String(item.status ?? '').toLowerCase();
  if (st === 'read' || st === 'seen' || st === 'done') return true;
  if (st === 'unread' || st === 'new' || st === 'pending') return false;

  return false;
}

function inferKind(item: NotificationItem): AdminNotificationKind {
  const raw = `${item.type ?? ''} ${item.category ?? ''}`.toLowerCase();
  if (
    raw.includes('appointment') ||
    raw.includes('موعد') ||
    raw.includes('booking')
  ) {
    return 'appointment';
  }
  if (
    raw.includes('message') ||
    raw.includes('رسالة') ||
    raw.includes('chat') ||
    raw.includes('consult')
  ) {
    return 'message';
  }
  if (
    raw.includes('access') ||
    raw.includes('وصول') ||
    raw.includes('request')
  ) {
    return 'access-request';
  }
  if (raw.includes('remind') || raw.includes('تذكير')) return 'reminder';
  if (raw.includes('cancel') || raw.includes('إلغاء')) return 'cancel';
  if (
    raw.includes('record') ||
    raw.includes('سجل') ||
    raw.includes('medical') ||
    raw.includes('file')
  ) {
    return 'record';
  }

  const title = (item.title ?? '').toLowerCase();
  if (title.includes('موعد جديد') || title.includes('حجز'))
    return 'appointment';
  if (title.includes('رسالة')) return 'message';
  if (title.includes('وصول') || title.includes('طلب')) return 'access-request';
  if (title.includes('تذكير')) return 'reminder';
  if (title.includes('إلغاء')) return 'cancel';
  if (title.includes('سجل')) return 'record';

  return 'appointment';
}

function formatRelativeTimeAr(iso: string | undefined): string {
  if (!iso || typeof iso !== 'string') return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 45) return 'الآن';
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    return m <= 1 ? 'منذ دقيقة' : `منذ ${m} دقائق`;
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return h <= 1 ? 'منذ ساعة' : `منذ ${h} ساعات`;
  }
  const d = Math.floor(sec / 86400);
  if (d === 1) return 'أمس';
  if (d < 7) return `منذ ${d} أيام`;
  return new Date(t).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * يحوّل عنصر الـ API إلى صف واجهة الإدارة. يُرجع null إن لم يكن للعنصر معرّف صالح.
 */
export function mapNotificationItemToAdminRow(
  item: NotificationItem,
): AdminNotificationRow | null {
  const id = notificationItemId(item);
  if (!id) return null;

  const isRead = normalizeNotificationRead(item);
  const isUnread = !isRead;

  return {
    id,
    kind: inferKind(item),
    title: (item.title ?? '').trim() || '—',
    description: (item.body ?? '').trim() || '—',
    timeLabel: formatRelativeTimeAr(item.createdAt ?? item.updatedAt),
    isUnread,
    /** الـ PDF لا يفرّق «جديد» عن «غير مقروء»؛ نعرض الشارة للغير مقروء. */
    isNew: isUnread,
  };
}

export function mapNotificationsToRows(
  items: NotificationItem[] | undefined,
): AdminNotificationRow[] {
  if (!items?.length) return [];
  return items
    .map((it) => mapNotificationItemToAdminRow(it))
    .filter((r): r is AdminNotificationRow => r != null);
}
