"use client";

import { BookMarked, Loader2, Search } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";

import {
  ClinicAccountsFilterTabs,
  ClinicAccountsSearchRow,
} from "@/components/doctor/clinic-accounts";

import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";

import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";

import { FacilityDirectoryCard } from "@/components/doctor/medical-services-directory/facility-directory-card";

import { buildMedicalServicesDirectoryKpis } from "@/components/doctor/medical-services-directory/medical-services-directory-stat-cards";

import { MedicalServicesDirectoryPagination } from "@/components/doctor/medical-services-directory/medical-services-directory-pagination";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";

import { useMedicalServicesDirectoryPage } from "@/hooks";

import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useI18n } from "@/i18n/provider";

import { formatBillingNumber } from "@/lib/doctor/billing/format";

import {
  MEDICAL_SERVICE_CATEGORY_TABS,
  type MedicalServiceCategory,
} from "@/lib/doctor/medical-services-directory/types";

const PAGE_SIZE = 8;

export default function DoctorMedicalServicesDirectoryPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<MedicalServiceCategory>("clinics");

  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const directoryQuery = useMedicalServicesDirectoryPage({
    search: debouncedSearch,

    category: activeCategory,

    page,

    pageSize: PAGE_SIZE,
  });
  const { retry: retryDirectory, retrying: retryingDirectory } = useRetryAction(
    () => directoryQuery.refetch(),
  );

  const directoryKpis = useMemo(
    () => buildMedicalServicesDirectoryKpis(directoryQuery.counts),

    [directoryQuery.counts],
  );

  const handleCategoryChange = (category: MedicalServiceCategory) => {
    setActiveCategory(category);

    setPage(1);

    setExpandedId(null);
  };

  const errorMessage = useMemo(() => {
    if (!directoryQuery.error) return null;

    return getUserFacingRequestErrorMessage(directoryQuery.error);
  }, [directoryQuery.error]);

  if (directoryQuery.isAwaitingData) {
    return (
      <>
        <Helmet>
          <title>
            {tr(
              "دليل الخدمات الطبية • LMJ Health",
              "Medical Services Directory • LMJ Health",
            )}
          </title>
        </Helmet>

        <div
          dir={dir}
          lang={locale}
          className="flex min-h-[360px] items-center justify-center"
        >
          <div className="flex items-center gap-3 font-cairo text-[14px] font-semibold text-[#667085]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {tr(
              "جارٍ تحميل دليل الخدمات الطبية…",
              "Loading medical services directory…",
            )}
          </div>
        </div>
      </>
    );
  }

  if (directoryQuery.isError && !directoryQuery.data) {
    return (
      <>
        <Helmet>
          <title>
            {tr(
              "دليل الخدمات الطبية • LMJ Health",
              "Medical Services Directory • LMJ Health",
            )}
          </title>
        </Helmet>

        <DoctorListErrorState
          title={tr(
            "تعذّر تحميل دليل الخدمات الطبية",
            "Failed to load medical services directory",
          )}
          brief={
            errorMessage ??
            tr(
              "حدث خطأ أثناء جلب الجهات الطبية المنشورة. حاول مرة أخرى.",
              "An error occurred while fetching published medical facilities. Try again.",
            )
          }
          onRetry={() => void retryDirectory()}
          retrying={retryingDirectory}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {tr(
            "دليل الخدمات الطبية • LMJ Health",
            "Medical Services Directory • LMJ Health",
          )}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          title={tr("دليل الخدمات الطبية", "Medical services directory")}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {formatBillingNumber(directoryQuery.totalAll, {
                  maximumFractionDigits: 0,
                })}
              </span>

              <span className="text-primary/90">
                {" "}
                {tr(
                  "— دليلك للوصول للخدمات والجهات الصحية المتاحة",
                  "— your guide to available health services and facilities",
                )}
              </span>
            </span>
          }
          headerIcon={<BookMarked className="h-8 w-8 text-white" />}
          kpis={directoryKpis}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder={tr(
            "ابحث عن جهة أو خدمة...",
            "Search a facility or service...",
          )}
          onValueChangeExtra={() => setPage(1)}
          onClear={() => {
            setSearch('');
            setActiveCategory('clinics');
            setPage(1);
          }}
        />

        <ClinicAccountsFilterTabs
          value={activeCategory}
          onChange={handleCategoryChange}
          options={MEDICAL_SERVICE_CATEGORY_TABS}
        />

        <section className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
          <h2 className="font-cairo text-[14px] font-extrabold text-[#92400E]">
            تنبيه مهم
          </h2>
          <div className="mt-2 space-y-1 font-cairo text-[12px] font-bold leading-7 text-[#92400E]">
            <p>هذا الدليل مخصّص لاستعراض الجهات الطبية المنشورة وبيانات التواصل معها.</p>
            <p>الحجز أو طلب الخدمة من داخل هذا المسار غير متاح حالياً.</p>
          </div>
        </section>

        <section className="space-y-4">
          {directoryQuery.facilities.length === 0 ? (
            <DoctorListEmptyIllustration
              variant="teal"
              imageSrc="/images/photo-not-found_appotemint.png"
              imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
              title={
                debouncedSearch.trim()
                  ? 'لا توجد جهات تطابق البحث في هذا التصنيف'
                  : 'لا توجد جهات منشورة في هذا التصنيف بعد'
              }
              subtitle={
                debouncedSearch.trim()
                  ? 'جرّب تعديل كلمات البحث أو تغيير التصنيف لعرض المزيد من النتائج'
                  : 'تصفح الجهات والخدمات الطبية المنشورة والمتاحة حالياً'
              }
              actionLabel="تصفح دليل الخدمات"
              onAction={() => setActiveCategory('clinics')}
              actionIcon={<Search className="h-4 w-4" />}
            />
          ) : (
            directoryQuery.facilities.map((facility) => (
              <FacilityDirectoryCard
                key={facility.id}
                facility={facility}
                expanded={expandedId === facility.id}
                onToggle={() =>
                  setExpandedId((current) =>
                    current === facility.id ? null : facility.id,
                  )
                }
              />
            ))
          )}
        </section>

        <MedicalServicesDirectoryPagination
          page={page}
          totalPages={directoryQuery.totalPages}
          total={directoryQuery.total}
          pageSize={PAGE_SIZE}
          disabled={false}
          onPageChange={setPage}
        />

        <div className="h-8" />
      </div>
    </>
  );
}
