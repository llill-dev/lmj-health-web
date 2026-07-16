import { Bell, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useDoctorNotificationsPage } from "@/hooks/doctor/notifications/useDoctorNotifications";
import { notificationItemId } from "@/lib/notifications/client";

function formatRelativeDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-SA");
}

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function NotificationCard({
  title,
  message,
  time,
  type,
  isRead,
}: {
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
  isRead?: boolean;
}) {
  const typeConfig = {
    info: {
      icon: Info,
      bgColor: "bg-[#EAF1FF]",
      iconColor: "text-[#3B82F6]",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-[#EAFBF0]",
      iconColor: "text-[#22C55E]",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-[#FFF2E8]",
      iconColor: "text-[#FF6A00]",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-4 rounded-[16px] px-4 py-4 sm:px-6 sm:py-5 ${
        isRead ? "bg-white" : "bg-[#F8FAFC]"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] ${config.bgColor} ${config.iconColor}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-cairo text-[16px] font-bold text-[#243044]">
              {title}
            </div>
            <div className="mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {message}
            </div>
          </div>
          {!isRead && (
            <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-semibold text-[#98A2B3]">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>
    </div>
  );
}

export default function SecretaryNotificationsPage() {
  const notificationsQuery = useDoctorNotificationsPage(false, 1, 100);
  const notifications = (notificationsQuery.listQuery.data?.notifications ?? []).map(
    (item) => ({
      id: notificationItemId(item) || `${item.title || "notice"}-${item.createdAt || "time"}`,
      title: item.title || "إشعار",
      message: item.body || "لا توجد تفاصيل إضافية.",
      time: formatRelativeDate(item.createdAt),
      type: item.type === "warning" ? "warning" : "info",
      isRead: Boolean(item.isRead ?? item.read ?? item.is_read),
    }),
  );

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="الإشعارات">
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-right">
              <h3 className="font-cairo text-[18px] font-bold text-[#243044]">
                الإشعارات
              </h3>
              <p className="mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]">
                {notifications.length} إشعار
              </p>
            </div>
            <button
              type="button"
              onClick={() => notificationsQuery.markAllReadMutation.mutate()}
              className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[13px] font-black text-[#1F2937] transition hover:bg-[#F8FAFC]"
            >
              تحديد الكل كمقروء
            </button>
          </div>

          {notificationsQuery.listQuery.isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center py-12">
              <p className="font-cairo text-[14px] font-semibold text-[#98A2B3]">
                جاري تحميل الإشعارات...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E9F7F6] text-primary">
                <Bell className="h-10 w-10" />
              </div>
              <div className="text-center">
                <h3 className="font-cairo text-[18px] font-bold text-[#243044]">
                  لا توجد إشعارات
                </h3>
                <p className="mt-2 font-cairo text-[14px] font-semibold text-[#98A2B3]">
                  سيتم عرض الإشعارات الجديدة هنا
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  title={notification.title}
                  message={notification.message}
                  time={notification.time}
                  type={notification.type}
                  isRead={notification.isRead}
                />
              ))}
            </div>
          )}
        </div>
      </SurfaceSection>
    </div>
  );
}
