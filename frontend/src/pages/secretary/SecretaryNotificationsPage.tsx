import { Bell, Check, Eye } from "lucide-react";

export default function SecretaryNotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header with wave background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8faf8] via-white to-[#f0fdf9] p-6 shadow-[0_14px_36px_-14px_rgba(15,143,139,0.2)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 14% 40%, rgba(15,143,139,0.12), transparent 38%), radial-gradient(circle at 88% 30%, rgba(20,184,166,0.1), transparent 36%)",
          }}
        />
        <div className="relative">
          <h1 className="font-cairo text-2xl font-bold text-primary">
            الإشعارات
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            لديك 3 إشعار جديد
          </p>
        </div>
      </div>

      {/* Notification Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-full bg-emerald-500 px-4 py-2 font-cairo text-sm font-bold text-white shadow-sm">
          0 جديد
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Check className="h-4 w-4" />
          تحديد الكل كمقروء
        </button>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 font-cairo text-sm font-bold text-[#64748b] shadow-sm transition hover:bg-gray-50">
            غير مقروءة (0)
          </button>
          <button className="rounded-xl bg-primary px-4 py-2 font-cairo text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] transition hover:bg-primary/90">
            الكل (0)
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-12 shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Bell className="h-12 w-12 text-primary" />
        </div>
        <p className="font-cairo text-lg font-bold text-[#0f172a]">
          لا يوجد اشعارات بعد .
        </p>
      </div>
    </div>
  );
}
