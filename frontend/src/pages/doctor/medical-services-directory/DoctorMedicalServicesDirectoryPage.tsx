"use client";

import { BookMarked, Loader2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";

import {
  ClinicAccountsFilterTabs,
  ClinicAccountsSearchRow,
} from "@/components/doctor/clinic-accounts";

import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";

import { FacilityDirectoryCard } from "@/components/doctor/medical-services-directory/facility-directory-card";

import { buildMedicalServicesDirectoryKpis } from "@/components/doctor/medical-services-directory/medical-services-directory-stat-cards";

import { MedicalServicesDirectoryPagination } from "@/components/doctor/medical-services-directory/medical-services-directory-pagination";

import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";

import { useMedicalServicesDirectoryPage } from "@/hooks";

import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";

import { formatBillingNumber } from "@/lib/doctor/billing/format";

import {
  MEDICAL_SERVICE_CATEGORY_TABS,
  type MedicalServiceCategory,
} from "@/lib/doctor/medical-services-directory/types";

const PAGE_SIZE = 8;

export default function DoctorMedicalServicesDirectoryPage() {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<MedicalServiceCategory>("labs");

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
          <title>دليل الخدمات الطبية • LMJ Health</title>
        </Helmet>

        <div
          dir="rtl"
          lang="ar"
          className="flex min-h-[360px] items-center justify-center"
        >
          <div className="flex items-center gap-3 font-cairo text-[14px] font-semibold text-[#667085]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            جارٍ تحميل دليل الخدمات الطبية…
          </div>
        </div>
      </>
    );
  }

  if (directoryQuery.isError && !directoryQuery.data) {
    return (
      <>
        <Helmet>
          <title>دليل الخدمات الطبية • LMJ Health</title>
        </Helmet>

        <DoctorListErrorState
          title="تعذّر تحميل دليل الخدمات الطبية"
          brief={
            errorMessage ??
            "حدث خطأ أثناء جلب المنشآت من الخادم. حاول مرة أخرى."
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
        <title>دليل الخدمات الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          title="دليل الخدمات الطبية"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {formatBillingNumber(directoryQuery.totalAll, {
                  maximumFractionDigits: 0,
                })}
              </span>

              <span className="text-primary/90">
                {" "}
                — دليلك للوصول للخدمات والجهات الصحية المتاحة
              </span>
            </span>
          }
          headerIcon={<BookMarked className="h-8 w-8 text-white" />}
          kpis={directoryKpis}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن منشأة أو خدمة..."
          onValueChangeExtra={() => setPage(1)}
        />

        <ClinicAccountsFilterTabs
          value={activeCategory}
          onChange={handleCategoryChange}
          options={MEDICAL_SERVICE_CATEGORY_TABS}
        />

        <section className="space-y-4">
          {directoryQuery.facilities.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-16 text-center font-cairo text-[14px] font-semibold text-[#667085]">
              لا توجد منشآت مطابقة لبحثك في هذا التصنيف.
            </div>
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
