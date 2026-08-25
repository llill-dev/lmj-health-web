"use client";

import { BookOpen, ExternalLink, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import { usePlatformMedicalLibrary } from "@/hooks/platform";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useI18n } from "@/i18n/provider";

const TYPE_LABELS: Record<string, string> = {
  NEWS: "أخبار طبية",
  GENERAL_ADVICE: "نصائح عامة",
  CONDITION: "حالات مرضية",
  SYMPTOM: "أعراض",
  MEDICATION: "أدوية",
};
const TYPE_OPTIONS = [
  "all",
  "NEWS",
  "GENERAL_ADVICE",
  "CONDITION",
  "SYMPTOM",
  "MEDICATION",
] as const;
type MedicalLibraryFilter = (typeof TYPE_OPTIONS)[number];
const SORT_OPTIONS = ["latest", "popular"] as const;
type MedicalLibrarySort = (typeof SORT_OPTIONS)[number];
type MedicalLibraryItem = typeof usePlatformMedicalLibrary extends (
  ...args: any[]
) => infer R
  ? R extends { items: infer T }
    ? T extends Array<infer U>
      ? U
      : never
    : never
  : never;

const TYPE_DESCRIPTIONS: Record<
  Exclude<MedicalLibraryFilter, "all">,
  string
> = {
  NEWS: "آخر الأخبار والتحديثات الطبية المنشورة من المصادر المعتمدة.",
  GENERAL_ADVICE:
    "إرشادات يومية ونصائح وقائية لتحسين نمط الحياة والصحة العامة.",
  CONDITION:
    "شروحات مبسطة حول الحالات المرضية والأسباب والعلامات المرتبطة بها.",
  SYMPTOM: "محتوى يساعد على فهم الأعراض الشائعة ومتى تستدعي المتابعة الطبية.",
  MEDICATION: "مقالات ومواد توعوية مرتبطة بالأدوية والاستعمال الآمن.",
};

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

function renderLibraryCard(item: MedicalLibraryItem, listQueryString: string) {
  return (
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
  );
}

export default function PublicMedicalLibraryPage() {
  const { locale, dir } = useI18n();
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
  const initialSort = searchParams.get("sort");
  const [activeSort, setActiveSort] = useState<MedicalLibrarySort>(
    initialSort && SORT_OPTIONS.includes(initialSort as MedicalLibrarySort)
      ? (initialSort as MedicalLibrarySort)
      : "latest",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const libraryQuery = usePlatformMedicalLibrary({
    q: debouncedSearch,
    language: locale,
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
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (activeSort === "popular") {
      return items.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }
    return items.sort((a, b) => {
      const aDate = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bDate = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bDate - aDate;
    });
  }, [activeSort, filteredItems]);
  const listQueryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch.trim()) qs.set("q", debouncedSearch.trim());
    if (activeType !== "all") qs.set("type", activeType);
    if (activeSort !== "latest") qs.set("sort", activeSort);
    const value = qs.toString();
    return value ? `?${value}` : "";
  }, [activeSort, activeType, debouncedSearch]);
  const activeTypeLabel =
    activeType === "all" ? "كل الأنواع" : TYPE_LABELS[activeType];
  const hasActiveFilters =
    Boolean(debouncedSearch.trim()) ||
    activeType !== "all" ||
    activeSort !== "latest";
  const surfacedSections = useMemo(() => {
    const latest = [...libraryQuery.items]
      .sort((a, b) => {
        const aDate = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bDate = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return bDate - aDate;
      })
      .slice(0, 3);
    const featured = [...libraryQuery.items]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 3);
    const quickTips = libraryQuery.items
      .filter((item) => item.type === "GENERAL_ADVICE")
      .slice(0, 3);

    return { latest, featured, quickTips };
  }, [libraryQuery.items]);
  const groupedItems = useMemo(
    () =>
      TYPE_OPTIONS.filter(
        (type): type is Exclude<MedicalLibraryFilter, "all"> => type !== "all",
      ).map((type) => ({
        type,
        label: TYPE_LABELS[type],
        description: TYPE_DESCRIPTIONS[type],
        items: sortedItems.filter((item) => item.type === type),
      })),
    [sortedItems],
  );
  const visibleSections = useMemo(
    () =>
      activeType === "all"
        ? groupedItems.filter((section) => section.items.length > 0)
        : groupedItems.filter((section) => section.type === activeType),
    [activeType, groupedItems],
  );

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set("q", debouncedSearch.trim());
    if (activeType !== "all") next.set("type", activeType);
    if (activeSort !== "latest") next.set("sort", activeSort);
    setSearchParams(next, { replace: true });
  }, [activeSort, activeType, debouncedSearch, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>المكتبة الطبية • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <section className="overflow-hidden rounded-[28px] border border-[#D9F2EF] bg-[linear-gradient(135deg,#E6F7F5_0%,#FFFFFF_60%,#F5FBFA_100%)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex gap-2">
                {" "}
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.2)]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h1 className="font-cairo text-[28px] font-black text-[#101828] sm:text-[34px]">
                  المكتبة الطبية
                </h1>
              </div>
              <p className="mt-3 font-cairo text-[14px] font-semibold leading-7 text-[#475467] sm:text-[15px]">
                تصفح الأخبار الطبية والنصائح العامة والمحتوى الصحي المنشور ضمن
                المنصة.
              </p>
            </div>

            <label className="relative block w-full max-w-[360px]">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث في المحتوى الطبي..."
                className="h-12 w-full rounded-2xl border border-[#D0D5DD] bg-white pe-12 ps-12 text-start font-cairo text-[14px] font-semibold text-[#101828] outline-none transition focus:border-primary focus:ring-4 focus:ring-[#0F8F8B]/10"
              />
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute end-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#344054]"
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
                : libraryQuery.items.filter((item) => item.type === type)
                    .length;
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
                {type === "all" ? "الكل" : TYPE_LABELS[type]}{" "}
                {count ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SORT_OPTIONS.map((sort) => (
            <button
              key={sort}
              type="button"
              onClick={() => setActiveSort(sort)}
              className={`rounded-full border px-4 py-2 font-cairo text-[12px] font-extrabold transition ${
                activeSort === sort
                  ? "border-[#0F766E] bg-[#0F766E] text-white"
                  : "border-[#D9F2EF] bg-white text-[#0F766E] hover:bg-[#F0FDFA]"
              }`}
            >
              {sort === "latest" ? "الأحدث" : "الأكثر قراءة"}
            </button>
          ))}
        </div>

        {!libraryQuery.isAwaitingData && !libraryQuery.isError ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#E4E7EC] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="font-cairo text-[13px] font-extrabold text-[#344054]">
                {sortedItems.length} نتيجة ضمن{" "}
                <span className="text-primary">{activeTypeLabel}</span>
              </div>
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {debouncedSearch.trim()
                  ? `البحث الحالي: ${debouncedSearch.trim()}`
                  : activeSort === "popular"
                    ? "يعرض المحتوى الأعلى قراءة"
                    : "يعرض أحدث المحتوى المنشور"}
              </div>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveType("all");
                  setActiveSort("latest");
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#B8E6E0] bg-[#F0FDFA] px-4 py-2 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#E6F7F5]"
              >
                إعادة ضبط
              </button>
            ) : (
              <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
                عرض كامل
              </div>
            )}
          </div>
        ) : null}

        {!libraryQuery.isAwaitingData && !libraryQuery.isError ? (
          <section className="mt-4 rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <h2 className="font-cairo text-[14px] font-black text-[#92400E]">
              ملاحظات حول الميزة الحالية
            </h2>
            <div className="mt-2 space-y-1 font-cairo text-[12px] font-bold leading-7 text-[#92400E]">
              <p>
                المتاح حالياً هو قراءة المحتوى الطبي المنشور وتصفح تفاصيله
                ومصادره.
              </p>
              <p>
                مكتبة ملفات PDF المشتركة أو المستندات الطبية العامة غير متاحة
                حالياً من خلال هذا القسم.
              </p>
              <p>
                الحجز أو طلب الخدمات الطبية يتم عبر المسارات المخصصة الأخرى وليس
                من داخل هذه المكتبة.
              </p>
            </div>
          </section>
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
        ) : sortedItems.length === 0 ? (
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
                setActiveSort("latest");
              }}
              actionIcon={<Search className="h-4 w-4" />}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {!debouncedSearch.trim() && activeType === "all" ? (
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {[
                  {
                    key: "latest",
                    title: "أحدث الأخبار",
                    description: "آخر ما نُشر حديثاً في المكتبة الطبية.",
                    items: surfacedSections.latest,
                  },
                  {
                    key: "featured",
                    title: "مقالات مميزة",
                    description: "المحتوى الأعلى قراءة وتفاعلاً.",
                    items: surfacedSections.featured,
                  },
                  {
                    key: "quick-tips",
                    title: "نصائح سريعة",
                    description: "مختارات سريعة من النصائح العامة العملية.",
                    items: surfacedSections.quickTips,
                  },
                ].map((section) => (
                  <div
                    key={section.key}
                    className="rounded-[24px] border border-[#E4E7EC] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
                  >
                    <h2 className="font-cairo text-[20px] font-black text-[#101828]">
                      {section.title}
                    </h2>
                    <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
                      {section.description}
                    </p>
                    <div className="mt-4 space-y-3">
                      {section.items.length ? (
                        section.items.map((item) => (
                          <Link
                            key={item.id}
                            to={`/medical-library/${encodeURIComponent(item.slug)}${listQueryString}`}
                            className="block rounded-[16px] border border-[#EEF2F6] bg-[#FCFCFD] p-4 transition hover:border-[#B8E6E0] hover:bg-white"
                          >
                            <div className="font-cairo text-[11px] font-extrabold text-primary">
                              {TYPE_LABELS[item.type] ?? item.type}
                            </div>
                            <div className="mt-2 line-clamp-2 font-cairo text-[14px] font-black leading-7 text-[#101828]">
                              {item.title}
                            </div>
                            <div className="mt-2 font-cairo text-[11px] font-bold text-[#98A2B3]">
                              {formatPublishedAt(item.publishedAt)}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-[16px] border border-dashed border-[#D9F2EF] px-4 py-6 text-center font-cairo text-[12px] font-bold text-[#98A2B3]">
                          لا يوجد محتوى متاح حالياً.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ) : null}
            {visibleSections.map((section) => (
              <section
                key={section.type}
                className="rounded-[24px] border border-[#E4E7EC] bg-[linear-gradient(180deg,#FCFFFE_0%,#FFFFFF_100%)] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <div className="mb-5 flex flex-col gap-3 border-b border-[#EEF2F6] pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-cairo text-[22px] font-black text-[#101828]">
                      {section.label}
                    </h2>
                    <p className="mt-2 max-w-2xl font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-[#E6F7F5] px-4 py-2 font-cairo text-[12px] font-extrabold text-primary">
                      {section.items.length} عنصر
                    </div>
                    {activeType === "all" ? (
                      <button
                        type="button"
                        onClick={() => setActiveType(section.type)}
                        className="inline-flex items-center justify-center rounded-full border border-[#B8E6E0] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                      >
                        عرض القسم
                      </button>
                    ) : activeType === section.type ? (
                      <button
                        type="button"
                        onClick={() => setActiveType("all")}
                        className="inline-flex items-center justify-center rounded-full border border-[#E4E7EC] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#475467] transition hover:border-[#B8E6E0] hover:text-primary"
                      >
                        عرض كل الأقسام
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(activeType === "all"
                    ? section.items.slice(0, 3)
                    : section.items
                  ).map((item) => renderLibraryCard(item, listQueryString))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
