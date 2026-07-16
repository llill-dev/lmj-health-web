import { Search, Filter, Stethoscope, Star, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useDoctorDoctorsDirectory } from "@/hooks/doctor/directory/useDoctorDoctorsDirectory";

export default function SecretaryDoctorsDirectoryPage() {
  const [search, setSearch] = useState("");
  const directoryQuery = useDoctorDoctorsDirectory({
    search: search.trim() || "",
    page: 1,
    limit: 24,
  });
  const doctors = useMemo(() => directoryQuery.doctors ?? [], [directoryQuery.doctors]);

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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          تصفية
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {directoryQuery.isAwaitingData ? (
          <div className="col-span-full py-8 text-center font-cairo text-sm font-semibold text-[#64748b]">
            جاري تحميل دليل الأطباء...
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full py-8 text-center font-cairo text-sm font-semibold text-[#64748b]">
            لا توجد نتائج مطابقة.
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-cairo text-base font-bold text-[#0f172a]">
                    {doctor.name}
                  </h3>
                  <p className="font-cairo text-sm font-medium text-[#64748b]">
                    {doctor.specialty}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-cairo text-sm font-bold text-[#0f172a]">
                      {doctor.rating.toFixed(1)}
                    </span>
                    <span className="font-cairo text-xs font-medium text-[#64748b]">
                      ({doctor.reviews} تقييم)
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#64748b]" />
                  <span className="font-cairo text-sm text-[#0f172a]">
                    {doctor.city || "غير محدد"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#64748b]" />
                  <span className="font-cairo text-sm text-[#0f172a]">
                    {doctor.phone || "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
