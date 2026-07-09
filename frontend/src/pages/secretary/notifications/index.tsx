import { Bell, Filter, Check, X } from "lucide-react";

export default function SecretaryNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            الإشعارات
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            إدارة الإشعارات
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          تصفية
        </button>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Bell className="h-16 w-16 text-[#cbd5e1] mb-4" />
          <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-2">
            لا توجد إشعارات
          </h3>
          <p className="font-cairo text-sm font-medium text-[#64748b]">
            سيتم عرض الإشعارات الجديدة هنا
          </p>
        </div>
      </div>
    </div>
  );
}
