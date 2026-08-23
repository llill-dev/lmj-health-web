import { Bell } from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useI18n } from "@/i18n/provider";

export default function AdminNotificationsHeading({
  newCount,
  onBroadcastClick,
}: {
  newCount: number;
  onBroadcastClick?: () => void;
}) {
  const { t } = useI18n();
  return (
    <AdminDashboardOverview
      variant="admin"
      surface="mint"
      title={t('adminNotifications.heading')}
      subtitle={t('adminNotifications.subtitle').replace('{count}', String(newCount))}
      headerIcon={<Bell className="h-8 w-8 text-white" />}
      actionLabel={t('adminNotifications.action.broadcast')}
      onActionClick={onBroadcastClick}
      kpis={[
        {
          key: "unread",
          icon: <Bell className="h-5 w-5 shrink-0" />,
          value: newCount,
          label: t('adminNotifications.kpi.unread'),
        },
      ]}
    />
  );
}
