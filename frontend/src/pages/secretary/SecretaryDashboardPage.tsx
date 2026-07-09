import {
  Users,
  Clock,
  Calendar,
  CheckCircle,
  Search,
  Plus,
  UserPlus,
} from "lucide-react";

export default function SecretaryDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Account Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8faf8] via-white to-[#f0fdf9] p-6 shadow-[0_14px_36px_-14px_rgba(15,143,139,0.2)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 14% 40%, rgba(15,143,139,0.12), transparent 38%), radial-gradient(circle at 88% 30%, rgba(20,184,166,0.1), transparent 36%)",
          }}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-cairo text-sm font-bold text-primary">
                  حالة الحساب نشط /
                </span>
              </div>
              <h2 className="font-cairo text-lg font-bold text-[#0f172a] mb-1">
                الطبيب المسؤول د. خالد عبد الله
              </h2>
              <p className="font-cairo text-sm font-medium text-[#64748b] mb-3">
                طب القلب
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="font-cairo text-sm font-bold text-[#0f172a]">
                    4.8
                  </span>
                  <span className="font-cairo text-xs font-medium text-[#64748b]">
                    (1 تقييم)
                  </span>
                </div>
                <div className="font-cairo text-sm font-bold text-primary">
                  $3
                </div>
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-cairo text-xs font-bold text-emerald-700">
              إجمالي
            </span>
          </div>
          <div className="font-cairo text-2xl font-bold text-[#0f172a]">2</div>
          <div className="font-cairo text-sm font-medium text-[#64748b]">
            عدد المرضى
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-cairo text-xs font-bold text-emerald-700">
              مكتمل
            </span>
          </div>
          <div className="font-cairo text-2xl font-bold text-[#0f172a]">0</div>
          <div className="font-cairo text-sm font-medium text-[#64748b]">
            الأوقات المتاحة
          </div>
          <div className="mt-1 font-cairo text-xs font-medium text-emerald-600">
            من أداء ممتاز
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 font-cairo text-xs font-bold text-orange-700">
              قادم
            </span>
          </div>
          <div className="font-cairo text-2xl font-bold text-[#0f172a]">2</div>
          <div className="font-cairo text-sm font-medium text-[#64748b]">
            مواعيد الانتظار
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-cairo text-xs font-bold text-primary">
              اليوم
            </span>
          </div>
          <div className="font-cairo text-2xl font-bold text-[#0f172a]">2</div>
          <div className="font-cairo text-sm font-medium text-[#64748b]">
            مواعيد اليوم
          </div>
          <div className="mt-1 font-cairo text-xs font-medium text-[#64748b]">
            2 معلق
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          أزرار سريعة
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
            <Search className="h-4 w-4" />
            بحث عن مريض
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
            <UserPlus className="h-4 w-4" />
            إضافة مريض مؤقت
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] transition hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            حجز موعد جديد
          </button>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="border-b border-[#e2e8f0] px-6 py-4">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
            جدول اليوم
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-gray-50">
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  اسم المريض
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right font-cairo text-xs font-bold text-[#64748b]">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e2e8f0]">
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  09:00
                </td>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  سارة علي
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
                    مجدول
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                    عرض
                  </button>
                </td>
              </tr>
              <tr className="border-b border-[#e2e8f0]">
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  10:30
                </td>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  أحمد نور
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 font-cairo text-xs font-bold text-orange-700">
                    مؤجل
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                    عرض
                  </button>
                </td>
              </tr>
              <tr className="border-b border-[#e2e8f0]">
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  11:00
                </td>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  ليلى محمد
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
                    مجدول
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                    عرض
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  14:00
                </td>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  كريم حسن
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-cairo text-xs font-bold text-blue-700">
                    مكتمل
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                    عرض
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
