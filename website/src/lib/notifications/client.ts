import { get, patch, post } from "@/lib/api";
import type { ApiSuccessEnvelope } from "@/lib/admin/types";

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
  /** بدائل شائعة من الـ API إن لم يُرسل `isRead` */
  read?: boolean;
  is_read?: boolean;
  readAt?: string;
  read_at?: string;
  status?: string;
  /** نوع منطقي للإشعار إن وُجد (نص حر من الخادم) */
  type?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function notificationItemId(item: NotificationItem): string | undefined {
  const raw = item._id ?? item.id;
  if (raw == null || String(raw) === "") return undefined;
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

export type BroadcastNotificationInput = {
  group: string;
  type: string;
  title: string;
  body: string;
  data?: string;
};

export type BroadcastNotificationResponse = ApiSuccessEnvelope & {
  notification?: NotificationItem;
};

type NotificationsEnvelope = {
  notifications?: unknown;
  items?: unknown;
  results?: unknown;
  data?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
};

function asNotificationsEnvelope(value: unknown): NotificationsEnvelope | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as NotificationsEnvelope)
    : null;
}

function isNotificationItemArray(value: unknown): value is NotificationItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && !Array.isArray(item))
  );
}

function readNotificationItems(value: unknown): NotificationItem[] | undefined {
  const record = asNotificationsEnvelope(value);
  if (!record) return undefined;

  return (
    (isNotificationItemArray(record.notifications) ? record.notifications : undefined) ??
    (isNotificationItemArray(record.items) ? record.items : undefined) ??
    (isNotificationItemArray(record.results) ? record.results : undefined) ??
    readNotificationItems(record.data) ??
    readNotificationItems(record.result)
  );
}

function normalizeNotificationsListResponse(
  response: NotificationsListResponse,
): NotificationsListResponse {
  const record = asNotificationsEnvelope(response);
  const nested =
    asNotificationsEnvelope(record?.data) ?? asNotificationsEnvelope(record?.result);
  const notifications = readNotificationItems(response) ?? [];

  return {
    ...response,
    notifications,
    page:
      typeof response.page === "number"
        ? response.page
        : typeof nested?.page === "number"
          ? nested.page
          : response.page,
    limit:
      typeof response.limit === "number"
        ? response.limit
        : typeof nested?.limit === "number"
          ? nested.limit
          : response.limit,
    total:
      typeof response.total === "number"
        ? response.total
        : typeof nested?.total === "number"
          ? nested.total
          : response.total,
  };
}

export const notificationsApi = {
  list: (params: NotificationsListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page != null) qs.set("page", String(params.page));
    if (params.limit != null) qs.set("limit", String(params.limit));
    if (params.unread_only === true) qs.set("unread_only", "true");
    const suffix = qs.toString();
    return get<NotificationsListResponse>(
      suffix ? `/api/notifications?${suffix}` : "/api/notifications",
      { locale: "ar" },
    ).then(normalizeNotificationsListResponse);
  },

  /** PATCH /notifications/read-all — API-3.pdf */
  readAll: () =>
    patch<NotificationsReadAllResponse>(
      "/api/notifications/read-all",
      {},
      { locale: "ar" },
    ),

  /** PATCH /notifications/:id/read — API-3.pdf */
  readOne: (id: string) =>
    patch<NotificationsReadAllResponse>(
      `/api/notifications/${id}/read`,
      {},
      { locale: "ar" },
    ),

  /** POST /notifications/broadcast — API-3 index */
  broadcast: (input: BroadcastNotificationInput) =>
    post<BroadcastNotificationResponse>("/api/notifications/broadcast", input, {
      locale: "ar",
    }),
};
