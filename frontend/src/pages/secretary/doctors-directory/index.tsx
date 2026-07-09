import { Search, Filter, Stethoscope, Star, MapPin, Phone, Mail } from "lucide-react";

export default function SecretaryDoctorsDirectoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            دليل الأطباء
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            قائمة الأطباء المتاحين
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="بحث عن طبيب..."
            className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          تصفية
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-cairo text-base font-bold text-[#0f172a]">
                د. خالد عبد الله
              </h3>
              <p className="font-cairo text-sm font-medium text-[#64748b]">
                طب القلب
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-cairo text-sm font-bold text-[#0f172a]">
                  4.8
                </span>
                <span className="font-cairo text-xs font-medium text-[#64748b]">
                  (1 تقييم)
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                مستشفى القلب التخصصي، دمشق
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                +966506789012
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-cairo text-base font-bold text-[#0f172a]">
                د. فاطمة أحمد
              </h3>
              <p className="font-cairo text-sm font-medium text-[#64748b]">
                طب الأطفال
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-cairo text-sm font-bold text-[#0f172a]">
                  4.9
                </span>
                <span className="font-cairo text-xs font-medium text-[#64748b]">
                  (15 تقييم)
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                مركز الأطفال الطبي، دمشق
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                +966598765432
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-cairo text-base font-bold text-[#0f172a]">
                د. محمد علي
              </h3>
              <p className="font-cairo text-sm font-medium text-[#64748b]">
                طب الجلدية
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-cairo text-sm font-bold text-[#0f172a]">
                  4.7
                </span>
                <span className="font-cairo text-xs font-medium text-[#64748b]">
                  (8 تقييمات)
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                عيادة الجلدية، دمشق
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#64748b]" />
              <span className="font-cairo text-sm text-[#0f172a]">
                +966511223344
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
