import { Search, Filter, Stethoscope, Star, MapPin, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDoctorDoctorsDirectory } from "@/hooks/doctor/directory/useDoctorDoctorsDirectory";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { MedicalRecordsPagination } from "@/components/doctor/medical-records/medical-records-pagination";
import { useI18n } from "@/i18n/provider";


const CONSULTATION_TYPE_OPTIONS: Array<{ value: "" | "online" | "offline"; label: [string, string] }> = [
  { value: "", label: ["الكل", "All"] },
  { value: "online", label: ["أونلاين", "Online"] },
  { value: "offline", label: ["حضوري", "In-person"] },
];

export default function SecretaryDoctorsDirectoryPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [consultationType, setConsultationType] = useState<"" | "online" | "offline">("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const { hasPermission } = useSecretaryPermissions();
  // Backend GET /doctors/internal/directory only requires Doctor/Secretary
  // role membership — no specific permission is enforced. We still require
  // appointments:view (a lesser permission than :book) so a secretary needs
  // at least some appointment-related access before browsing the directory.
  const canViewDirectory = hasPermission("appointments:view");
  const activeFilterCount = [specialization, city, country, consultationType, minRating].filter(
    Boolean,
  ).length;

  const directoryQuery = useDoctorDoctorsDirectory(
    {
      search: search.trim() || "",
      specialization: specialization.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      consultationType: consultationType || undefined,
      minRating: minRating ? Number(minRating) : undefined,
      page,
      limit: pageSize,
    },
    canViewDirectory,
  );
  const doctors = useMemo(
    () => directoryQuery.doctors ?? [],
    [directoryQuery.doctors],
  );

  useEffect(() => {
    setPage(1);
  }, [search, specialization, city, country, consultationType, minRating, pageSize]);

  const clearFilters = () => {
    setSpecialization("");
    setCity("");
    setCountry("");
    setConsultationType("");
    setMinRating("");
  };

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
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          {tr("تصفية", "Filter")}
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {filtersOpen ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder={tr("التخصص", "Specialization")}
              className="h-[38px] rounded-[10px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary"
            />
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={tr("المدينة", "City")}
              className="h-[38px] rounded-[10px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary"
            />
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder={tr("الدولة", "Country")}
              className="h-[38px] rounded-[10px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary"
            />
            <select
              value={consultationType}
              onChange={(event) =>
                setConsultationType(event.target.value as "" | "online" | "offline")
              }
              className="h-[38px] rounded-[10px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary"
            >
              {CONSULTATION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {tr(option.label[0], option.label[1])}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              placeholder={tr("أقل تقييم", "Min. rating")}
              className="h-[38px] rounded-[10px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary"
            />
          </div>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1 font-cairo text-[13px] font-bold text-[#B42318] hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              {tr("مسح عوامل التصفية", "Clear filters")}
            </button>
          ) : null}
        </div>
      ) : null}

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
              <div className="col-span-full text-start font-cairo text-xs font-semibold text-[#64748b]">
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

      {canViewDirectory && !directoryQuery.isError && directoryQuery.total > 0 ? (
        <MedicalRecordsPagination
          page={page}
          totalPages={Math.max(1, Math.ceil(directoryQuery.total / pageSize))}
          showingFrom={(page - 1) * pageSize + 1}
          showingTo={Math.min(page * pageSize, directoryQuery.total)}
          total={directoryQuery.total}
          pageSize={pageSize}
          itemLabel={tr("طبيب", "doctor")}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      ) : null}
    </div>
  );
}
