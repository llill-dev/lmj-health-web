import { Loader2 } from "lucide-react";
import AdminNotificationCard from "./AdminNotificationCard";
import type { AdminNotificationRow } from "./types";
import { NotificationCardSkeleton } from "@/components/admin/skeletons/NotificationCardSkeleton";
import { useI18n } from "@/i18n/provider";

export default function AdminNotificationsList({
  items,
  onMarkRead,
  pendingMarkId,
  isAwaitingData,
}: {
  items: AdminNotificationRow[];
  onMarkRead: (id: string) => void;
  pendingMarkId?: string | null;
  isAwaitingData?: boolean;
}) {
  const { locale, dir } = useI18n();
  if (isAwaitingData) {
    return (
      <ul className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i}>
            <NotificationCardSkeleton index={i} />
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <section
        dir={dir}
        lang={locale}
        className="flex min-h-[min(420px,70vh)] flex-col items-center justify-center rounded-[14px] border border-[#EAECF0] bg-white px-6 py-12 shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:px-10 sm:py-16"
        aria-label="لا توجد إشعارات"
      >
        <div className="flex w-full max-w-[420px] flex-col items-center justify-center">
          <img
            src="/images/notfound_notfication.png"
            alt="لا يوجد إشعارات"
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px] md:max-w-[340px]"
          />
        </div>
      </section>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <AdminNotificationCard
            item={item}
            onMarkRead={onMarkRead}
            markReadPending={pendingMarkId === item.id}
          />
        </li>
      ))}
    </ul>
  );
}
