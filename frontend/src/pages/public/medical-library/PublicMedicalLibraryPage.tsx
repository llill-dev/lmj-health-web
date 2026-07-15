"use client";

import { BookOpen, ExternalLink, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import { usePlatformMedicalLibrary } from "@/hooks/platform";
import { getUserFacingRequestErrorMessage } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  NEWS: "أخبار طبية",
  GENERAL_ADVICE: "نصائح عامة",
  CONDITION: "حالات مرضية",
  SYMPTOM: "أعراض",
  MEDICATION: "أدوية",
};
const TYPE_OPTIONS = ["all", "NEWS", "GENERAL_ADVICE", "CONDITION", "SYMPTOM", "MEDICATION"] as const;
type MedicalLibraryFilter = (typeof TYPE_OPTIONS)[number];

function formatPublishedAt(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PublicMedicalLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") ?? "",
  );
  const initialType = searchParams.get("type");
  const [activeType, setActiveType] = useState<MedicalLibraryFilter>(
    initialType && TYPE_OPTIONS.includes(initialType as MedicalLibraryFilter)
      ? (initialType as MedicalLibraryFilter)
      : "all",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const libraryQuery = usePlatformMedicalLibrary({
    q: debouncedSearch,
    language: "ar",
    limitPerType: 12,
  });

  const errorMessage = useMemo(() => {
    const failed = libraryQuery.queries.find((query) => query.error)?.error;
    return failed ? getUserFacingRequestErrorMessage(failed) : null;
  }, [libraryQuery.queries]);
  const filteredItems = useMemo(
    () =>
      activeType === "all"
        ? libraryQuery.items
        : libraryQuery.items.filter((item) => item.type === activeType),
    [activeType, libraryQuery.items],
  );
  const listQueryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch.trim()) qs.set("q", debouncedSearch.trim());
    if (activeType !== "all") qs.set("type", activeType);
    const value = qs.toString();
    return value ? `?${value}` : "";
  }, [activeType, debouncedSearch]);
  const activeTypeLabel =
    activeType === "all" ? "كل الأنواع" : TYPE_LABELS[activeType];

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set("q", debouncedSearch.trim());
    if (activeType !== "all") next.set("type", activeType);
    setSearchParams(next, { replace: true });
  }, [activeType, debouncedSearch, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>المكتبة الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-[#D9F2EF] bg-[linear-gradient(135deg,#E6F7F5_0%,#FFFFFF_60%,#F5FBFA_100%)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.2)]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="font-cairo text-[28px] font-black text-[#101828] sm:text-[34px]">
                المكتبة الطبية
              </h1>
              <p className="mt-3 font-cairo text-[14px] font-semibold leading-7 text-[#475467] sm:text-[15px]">
                تصفح الأخبار الطبية والنصائح العامة والمحتوى الصحي المنشور ضمن المنصة.
              </p>
            </div>

            <label className="relative block w-full max-w-[360px]">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث في المحتوى الطبي..."
                className="h-12 w-full rounded-2xl border border-[#D0D5DD] bg-white pr-12 pl-12 text-right font-cairo text-[14px] font-semibold text-[#101828] outline-none transition focus:border-primary focus:ring-4 focus:ring-[#0F8F8B]/10"
              />
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#344054]"
                  aria-label="مسح البحث"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((type) => {
            const count =
              type === "all"
                ? libraryQuery.items.length
                : libraryQuery.items.filter((item) => item.type === type).length;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full border px-4 py-2 font-cairo text-[12px] font-extrabold shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition ${
                  activeType === type
                    ? "border-primary bg-primary text-white"
                    : "border-[#D9F2EF] bg-white text-primary hover:bg-[#F0FDFA]"
                }`}
              >
                {type === "all" ? "الكل" : TYPE_LABELS[type]} {count ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {!libraryQuery.isAwaitingData && !libraryQuery.isError ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#E4E7EC] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <div className="font-cairo text-[13px] font-extrabold text-[#344054]">
              {filteredItems.length} نتيجة ضمن <span className="text-primary">{activeTypeLabel}</span>
            </div>
            <div className="font-cairo text-[12px] font-bold text-[#667085]">
              {debouncedSearch.trim()
                ? `البحث الحالي: ${debouncedSearch.trim()}`
                : "يعرض أحدث المحتوى المنشور"}
            </div>
          </div>
        ) : null}

        {libraryQuery.isAwaitingData ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 font-cairo text-[14px] font-bold text-[#667085]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              جارٍ تحميل المكتبة الطبية...
            </div>
          </div>
        ) : libraryQuery.isError ? (
          <div className="mt-6">
            <DoctorListErrorState
              title="تعذّر تحميل المكتبة الطبية"
              brief={
                errorMessage ??
                "حدث خطأ أثناء جلب المحتوى الطبي المنشور. حاول مرة أخرى."
              }
              onRetry={() => void libraryQuery.refetch()}
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-6">
            <DoctorListEmptyIllustration
              variant="teal"
              imageSrc="/images/photo-not-found_appotemint.png"
              imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
              title={
                search.trim()
                  ? "لا توجد نتائج مطابقة للبحث"
                  : activeType === "all"
                    ? "لا يوجد محتوى طبي منشور حالياً"
                    : `لا يوجد محتوى منشور ضمن ${TYPE_LABELS[activeType]} حالياً`
              }
              subtitle={
                search.trim()
                  ? "جرّب تعديل كلمات البحث للعثور على مقالات أو أخبار أخرى."
                  : "عند نشر مقالات ونصائح طبية جديدة ستظهر هنا تلقائياً."
              }
              actionLabel="مسح البحث"
              onAction={() => {
                setSearch("");
                setActiveType("all");
              }}
              actionIcon={<Search className="h-4 w-4" />}
            />
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/medical-library/${encodeURIComponent(item.slug)}${listQueryString}`}
                className="group rounded-[22px] border border-[#E4E7EC] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#B8E6E0] hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
              >
                {item.coverImage ? (
                  <div className="mb-4 overflow-hidden rounded-[18px] border border-[#EEF2F6] bg-[#F8FAFC]">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-[180px] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-[#E6F7F5] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {formatPublishedAt(item.publishedAt)}
                  </span>
                </div>

                <h2 className="mt-4 font-cairo text-[18px] font-black leading-8 text-[#101828] transition group-hover:text-primary">
                  {item.title}
                </h2>

                <p className="mt-3 line-clamp-4 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
                  {item.summary?.trim() || "افتح التفاصيل لقراءة المحتوى الطبي الكامل."}
                </p>

                {item.sourceName?.trim() ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#475467]">
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    المصدر: {item.sourceName.trim()}
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between">
                  <span className="font-cairo text-[12px] font-extrabold text-primary">
                    قراءة التفاصيل
                  </span>
                  <span className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {item.viewCount != null ? `${item.viewCount} مشاهدة` : ""}
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
