import { Bell } from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";

export default function AdminNotificationsHeading({
  newCount,
  onBroadcastClick,
}: {
  newCount: number;
  onBroadcastClick?: () => void;
}) {
  return (
    <AdminDashboardOverview
      variant="admin"
      surface="mint"
      title="الإشعارات"
      subtitle={`لديك ${newCount} إشعارات جديدة`}
      headerIcon={<Bell className="h-8 w-8 text-white" />}
      actionLabel="بث إشعار"
      onActionClick={onBroadcastClick}
      kpis={[
        {
          key: "unread",
          icon: <Bell className="h-5 w-5 shrink-0" />,
          value: newCount,
          label: "غير مقروءة",
        },
      ]}
    />
  );
}
