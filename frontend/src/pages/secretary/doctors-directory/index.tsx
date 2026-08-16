import { Search, Filter, Stethoscope, Star, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useDoctorDoctorsDirectory } from "@/hooks/doctor/directory/useDoctorDoctorsDirectory";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";

export default function SecretaryDoctorsDirectoryPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [search, setSearch] = useState("");
  const { hasPermission } = useSecretaryPermissions();
  const canViewDirectory = hasPermission("appointments:book");
  const directoryQuery = useDoctorDoctorsDirectory({
    search: search.trim() || "",
    page: 1,
    limit: 24,
  }, canViewDirectory);
  const doctors = useMemo(
    () => directoryQuery.doctors ?? [],
    [directoryQuery.doctors],
  );

  return (
    <div dir={dir} lang={locale} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            {tr("دليل الأطباء", "Doctors directory")}
          </h1>
          <p className="mt-1 font-cairo text-sm font-medium text-[#64748b]">
            {tr("قائمة الأطباء المتاحين", "List of available doctors")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            placeholder={tr("بحث عن طبيب...", "Search for a doctor...")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          {tr("تصفية", "Filter")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!canViewDirectory ? (
          <div className="col-span-full py-8 text-center font-cairo text-sm font-semibold text-[#64748b]">
            {tr(
              "لا تملك صلاحية الوصول إلى دليل الأطباء من حساب السكرتيرة هذا.",
              "This secretary account cannot access the doctors directory.",
            )}
          </div>
        ) : directoryQuery.isError ? (
          <div className="col-span-full space-y-3 py-8 text-center">
            <div className="font-cairo text-sm font-semibold text-[#b42318]">
              {tr(
                "تعذر تحميل دليل الأطباء حالياً.",
                "The doctors directory could not be loaded right now.",
              )}
            </div>
            <button
              type="button"
              onClick={() => void directoryQuery.refetch()}
              className="rounded-xl border border-[#d0d5dd] bg-white px-4 py-2 font-cairo text-sm font-bold text-[#0f172a] transition hover:bg-[#f8fafc]"
            >
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : directoryQuery.isAwaitingData ? (
          <div className="col-span-full py-8 text-center font-cairo text-sm font-semibold text-[#64748b]">
            {tr("جاري تحميل دليل الأطباء...", "Loading doctors directory...")}
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full py-8 text-center font-cairo text-sm font-semibold text-[#64748b]">
            {tr("لا توجد نتائج مطابقة.", "No matching results.")}
          </div>
        ) : (
          <>
            {directoryQuery.isRefetching ? (
              <div className="col-span-full text-right font-cairo text-xs font-semibold text-[#64748b]">
                {tr("جاري تحديث البيانات...", "Refreshing data...")}
              </div>
            ) : null}
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm"
              >
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
                        ({doctor.reviews} {tr("تقييم", "reviews")})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#64748b]" />
                    <span className="font-cairo text-sm text-[#0f172a]">
                      {doctor.city || tr("غير محدد", "Not specified")}
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}
