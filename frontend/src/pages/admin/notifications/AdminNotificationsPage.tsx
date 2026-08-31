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
  const { locale, dir, t } = useI18n();
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
            t("admin.notifications.markedReadBody").replace(
              "{title}",
              row.title,
            ),
            {
              title: t("admin.notifications.markedReadTitle"),
              variant: "success",
              durationMs: 3600,
            },
          );
        },
      });
    },
    [rows, markOneReadMutation, toast, t],
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
        <title>{t("admin.notifications.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-6">
        <AdminNotificationsHeading
          newCount={unreadTotal}
          onBroadcastClick={() => setBroadcastOpen(true)}
        />

        <div className="rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-5 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {t("admin.notifications.disclaimer")}
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
            {t("admin.notifications.refreshing")}
          </div>
        ) : null}

        {listQuery.isError ? (
          <div
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-start font-cairo text-[13px] font-semibold text-red-800"
          >
            {t("admin.notifications.loadError")}
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isRefetching}
              className="me-2 underline decoration-red-800 underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {listQuery.isRefetching
                ? t("admin.notifications.retrying")
                : t("admin.notifications.retry")}
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
              title={t("admin.notifications.markAllDialog.title")}
              icon={
                <CheckCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
              }
              description={t("admin.notifications.markAllDialog.description")}
              confirmLabel={t("admin.notifications.markAllDialog.confirm")}
              confirmDisabled={markAllReadMutation.isPending}
              onConfirm={async () => {
                await markAllReadMutation.mutateAsync();
              }}
              successToast={{
                title: t("admin.notifications.markAllDialog.successTitle"),
                message: t(
                  "admin.notifications.markAllDialog.successMessage",
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
