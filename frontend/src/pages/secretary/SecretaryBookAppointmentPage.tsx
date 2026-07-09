import { Calendar, Clock, User, Search } from "lucide-react";

export default function SecretaryBookAppointmentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            حجز موعد
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            حجز موعد جديد للمريض
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              المريض
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 py-2.5">
              <Search className="h-4 w-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="ابحث عن مريض"
                className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              التاريخ
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              الوقت
            </label>
            <input
              type="time"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              نوع الموعد
            </label>
            <select className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] focus:outline-none focus:border-primary">
              <option>اختر نوع الموعد</option>
              <option>استشارة عامة</option>
              <option>فحص دوري</option>
              <option>متابعة</option>
            </select>
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              ملاحظات
            </label>
            <textarea
              placeholder="أضف ملاحظات (اختياري)"
              rows={3}
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <button className="w-full rounded-xl bg-primary px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] transition hover:bg-primary/90">
            حجز الموعد
          </button>
        </div>
      </div>
    </div>
  );
}
