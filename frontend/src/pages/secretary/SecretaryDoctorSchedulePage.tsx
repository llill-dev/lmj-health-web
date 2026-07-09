import { Calendar, Clock, Check, X } from "lucide-react";

export default function SecretaryDoctorSchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            جدول عمل الطبيب
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            عرض وإدارة جدول عمل الطبيب
          </p>
        </div>
      </div>

      {/* Schedule Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
            جدول الأسبوع الحالي
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  السبت
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الأحد
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الاثنين
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الثلاثاء
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الأربعاء
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الخميس
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 17:00
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              متاح
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  الجمعة
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  عطلة
                </p>
              </div>
            </div>
            <span className="rounded-full bg-red-100 px-3 py-1 font-cairo text-xs font-bold text-red-700">
              مغلق
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
