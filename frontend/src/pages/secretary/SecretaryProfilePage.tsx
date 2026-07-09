import {
  Mail,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";

export default function SecretaryProfilePage() {
  return (
    <div className="space-y-6">
      {/* Secretary Info Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white font-cairo text-2xl font-bold shadow-[0_12px_28px_rgba(15,143,139,0.32)]">
            س
          </div>
          <div className="flex-1">
            <h2 className="font-cairo text-xl font-bold text-[#0f172a]">
              سارة محمد
            </h2>
            <p className="font-cairo text-sm font-medium text-[#64748b] mb-3">
              سكرتير
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#64748b]" />
                <span className="font-cairo text-sm text-[#0f172a]">
                  secretary1@example.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#64748b]" />
                <span className="font-cairo text-sm text-[#0f172a]">
                  1988-9-11
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info Card */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
            معلومات الاتصال
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  رقم الهاتف
                </p>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  +966506789012
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  العنوان
                </p>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  دمشق، سوريا
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Doctor Card */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
            الطبيب المسؤول
          </h3>
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-cairo text-sm font-bold text-[#0f172a]">
                د. خالد عبد الله
              </p>
              <p className="font-cairo text-xs font-medium text-[#64748b]">
                طب القلب
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                doctor1@example.com
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                مستشفى القلب التخصصي، دمشق
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Statistics Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
          إحصائيات الطبيب
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="font-cairo text-2xl font-bold text-primary">
              98%
            </div>
            <div className="font-cairo text-sm font-medium text-[#64748b]">
              معدل الحضور
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="font-cairo text-2xl font-bold text-primary">12</div>
            <div className="font-cairo text-sm font-medium text-[#64748b]">
              قائمة الانتظار
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="font-cairo text-2xl font-bold text-primary">85</div>
            <div className="font-cairo text-sm font-medium text-[#64748b]">
              عدد المرضى
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="font-cairo text-2xl font-bold text-primary">
              127
            </div>
            <div className="font-cairo text-sm font-medium text-[#64748b]">
              مجموع المواعيد
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
          الصلاحيات
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-cairo text-sm font-medium text-[#0f172a]">
                حجز المواعيد
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              مفعل
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-cairo text-sm font-medium text-[#0f172a]">
                عرض المواعيد
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              مفعل
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-cairo text-sm font-medium text-[#0f172a]">
                إلغاء المواعيد
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
              مفعل
            </span>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h3 className="font-cairo text-lg font-bold text-[#0f172a] mb-4">
          حالة الحساب
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-cairo text-sm font-medium text-[#64748b]">
              الحالة الحالية
            </p>
            <p className="font-cairo text-lg font-bold text-emerald-600">نشط</p>
          </div>
        </div>
      </div>
    </div>
  );
}
