import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCheck, Send } from "lucide-react";
import AdminNotificationsHeading from "@/components/admin/notifications/AdminNotificationsHeading";
import AdminNotificationsList from "@/components/admin/notifications/AdminNotificationsList";
import AdminNotificationsToolbar from "@/components/admin/notifications/AdminNotificationsToolbar";
import BroadcastNotificationDialog from "@/components/admin/notifications/dialogs/BroadcastNotificationDialog";
import type { NotificationFilterTab } from "@/components/admin/notifications/AdminNotificationsToolbar";
import { mapNotificationsToRows } from "@/components/admin/notifications/map-api-to-rows";
import { useAdminNotificationsPage } from "@/hooks/admin/notifications/useAdminNotifications";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import { useToast } from "@/components/ui/ToastProvider";
import { Pagination } from "@/components/admin/services/Pagination";
import { useI18n } from "@/i18n/provider";

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [filter, setFilter] = useState<NotificationFilterTab>("all");
  const [page, setPage] = useState(1);
  const [markAllOpen, setMarkAllOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const filterUnread = filter === "unread";

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const {
    listQuery,
    isAwaitingData,
    unreadTotal,
    allTotal,
    total,
    totalPages,
    markOneReadMutation,
    markAllReadMutation,
  } = useAdminNotificationsPage(filterUnread, page);

  const rows = useMemo(
    () => mapNotificationsToRows(listQuery.data?.notifications),
    [listQuery.data?.notifications],
  );

  const hasUnreadInView = useMemo(() => rows.some((r) => r.isUnread), [rows]);

  const handleMarkRead = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row?.isUnread) return;
      markOneReadMutation.mutate(id, {
        onSuccess: () => {
          toast(
            tr(
              `تُعامل «${row.title}» كمقروء. يبقى السجل في القائمة للمرجعية.`,
              `"${row.title}" is marked as read. The record stays in the list for reference.`,
            ),
            {
              title: tr("تمييز كمقروء", "Marked as read"),
              variant: "success",
              durationMs: 3600,
            },
          );
        },
      });
    },
    [rows, markOneReadMutation, toast, locale],
  );

  const handleMarkAll = useCallback(() => {
    if (unreadTotal === 0 && !hasUnreadInView) return;
    setMarkAllOpen(true);
  }, [unreadTotal, hasUnreadInView]);

  const handleFilterChange = useCallback((newFilter: NotificationFilterTab) => {
    setFilter(newFilter);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pendingMarkId =
    markOneReadMutation.isPending &&
    typeof markOneReadMutation.variables === "string"
      ? markOneReadMutation.variables
      : null;

  return (
    <>
      <Helmet>
        <title>{tr("الإشعارات", "Notifications")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-6">
        <AdminNotificationsHeading
          newCount={unreadTotal}
          onBroadcastClick={() => setBroadcastOpen(true)}
        />

        <div className="rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-5 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {tr(
              "تجمع هذه الشاشة بين متابعة الإشعارات الواردة وبث إشعارات جديدة. بعد تعليم الإشعار كمقروء يبقى ظاهرًا في القائمة للمرجعية، بينما يتم استخدام زر البث لإرسال إشعارات جديدة فقط.",
              "This screen combines incoming notification review with broadcasting new notifications. After a notification is marked as read it remains in the list for reference, while the broadcast action is only for sending new notifications.",
            )}
          </div>
        </div>

        <div className="rounded-[14px] border border-[#EAECF0] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] md:p-6">
          <AdminNotificationsToolbar
            filter={filter}
            onFilterChange={handleFilterChange}
            totalCount={allTotal}
            unreadCount={unreadTotal}
            onMarkAllRead={handleMarkAll}
            markAllPending={markAllReadMutation.isPending}
            hasUnreadInView={hasUnreadInView}
          />
        </div>

        {!isAwaitingData && listQuery.isRefetching ? (
          <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#D5E8E6] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-primary">
            {tr("جاري تحديث الإشعارات...", "Refreshing notifications...")}
          </div>
        ) : null}

        {listQuery.isError ? (
          <div
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-start font-cairo text-[13px] font-semibold text-red-800"
          >
            {tr("تعذر تحميل الإشعارات.", "Failed to load notifications.")}
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isRefetching}
              className="me-2 underline decoration-red-800 underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {listQuery.isRefetching
                ? tr("جارٍ إعادة المحاولة...", "Retrying...")
                : tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : (
          <>
            <AdminNotificationsList
              items={rows}
              onMarkRead={handleMarkRead}
              pendingMarkId={pendingMarkId}
              isAwaitingData={isAwaitingData}
            />

            <ConfirmActionDialog
              open={markAllOpen}
              onOpenChange={setMarkAllOpen}
              variant="primary"
              title={tr(
                "تأكيد تعليم كل الإشعارات كمقروء؟",
                "Mark all notifications as read?",
              )}
              icon={
                <CheckCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
              }
              description={tr(
                "سيتم وضع علامة مقروء على جميع إشعاراتك غير المقروءة في النظام. يمكنك التراجع فقط بإدخال بيانات جديدة — لا يسترجع الزر حالة «غير مقروء» تلقائياً.",
                "All your unread notifications will be marked as read. This cannot be undone automatically — the button does not restore unread status.",
              )}
              confirmLabel={tr("تعليم الكل كمقروء", "Mark all as read")}
              confirmDisabled={markAllReadMutation.isPending}
              onConfirm={async () => {
                await markAllReadMutation.mutateAsync();
              }}
              successToast={{
                title: tr("تم", "Done"),
                message: tr(
                  "تُعامل جميع إشعاراتك كمقروءة.",
                  "All your notifications are marked as read.",
                ),
                variant: "success",
              }}
            />

            {!isAwaitingData && totalPages > 1 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={handlePageChange}
              />
            ) : null}
          </>
        )}
      </div>

      {/* Broadcast Notification Dialog */}
      <BroadcastNotificationDialog
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        onSuccess={() => {
          // Optionally refetch notifications after broadcast
          listQuery.refetch();
        }}
      />
    </>
  );
}
