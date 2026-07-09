import { UserPlus, Phone, Mail, Calendar, MapPin } from "lucide-react";

export default function SecretaryCreateTemporaryPatientPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            إنشاء مريض مؤقت
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            إضافة مريض مؤقت للعيادة
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              placeholder="أدخل اسم المريض"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              placeholder="أدخل رقم الهاتف"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="أدخل البريد الإلكتروني"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              تاريخ الميلاد
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-[#0f172a] mb-2">
              العنوان
            </label>
            <input
              type="text"
              placeholder="أدخل العنوان"
              className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-primary"
            />
          </div>
          <button className="w-full rounded-xl bg-primary px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)] transition hover:bg-primary/90">
            إنشاء مريض مؤقت
          </button>
        </div>
      </div>
    </div>
  );
}
