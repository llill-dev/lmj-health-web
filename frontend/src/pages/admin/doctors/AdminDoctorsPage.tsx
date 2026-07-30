import { Helmet } from "react-helmet-async";
import {
  Ban,
  CheckCircle2,
  Clock,
  RefreshCw,
  Stethoscope,
  UserX,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import AdminSearchFiltersBar from "@/components/admin/AdminSearchFiltersBar";
import DoctorListCard from "@/components/admin/doctors/DoctorListCard";
import StyledSelect from "@/components/ui/styled-select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAdminDoctors } from "@/hooks/admin/doctors/useAdminDoctors";
import type { AdminDoctorApprovalStatus } from "@/lib/admin/types";
import { phoneComparisonKey } from "@/lib/phone/formatPhoneForDisplay";
import { isAdminDoctorOffboarded } from "@/lib/admin/doctors/isAdminDoctorOffboarded";
import { DoctorCardSkeleton } from "@/components/admin/skeletons/DoctorCardSkeleton";
import { useI18n } from "@/i18n/provider";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";

const TEAL = "#108B8B";

export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [searchParams] = useSearchParams();
  const specializationParam = searchParams.get("specialization") ?? "";

  const [filters, setFilters] = useState<{
    search: string;
    specialization: string;
    status: AdminDoctorApprovalStatus | "";
    city: string;
    country: string;
    from: string;
    to: string;
    page: number;
    limit: number;
  }>({
    search: "",
    specialization: "",
    status: "",
    city: "",
    country: "",
    from: "",
    to: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    setFilters((prev) =>
      prev.specialization === specializationParam
        ? prev
        : { ...prev, specialization: specializationParam, page: 1 },
    );
  }, [specializationParam]);

  const {
    doctors,
    total,
    results,
    isAwaitingData,
    isRefetching,
    error,
    refetch,
  } = useAdminDoctors({
    search: filters.search || undefined,
    specialization: filters.specialization || undefined,
    status: filters.status || undefined,
    city: filters.city || undefined,
    country: filters.country || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const duplicatePhoneKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const doctor of doctors) {
      const key = phoneComparisonKey(doctor.user?.phone);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [doctors]);

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const stats = useMemo(() => {
    const approvedCount = doctors.filter(
      (d) => d.approvalStatus === "approved" && !isAdminDoctorOffboarded(d),
    ).length;
    const pendingCount = doctors.filter(
      (d) => d.approvalStatus === "pending" && !isAdminDoctorOffboarded(d),
    ).length;
    const rejectedCount = doctors.filter(
      (d) => d.approvalStatus === "rejected" && !isAdminDoctorOffboarded(d),
    ).length;
    const offboardedCount = doctors.filter(isAdminDoctorOffboarded).length;

    return [
      ...(offboardedCount > 0
        ? [
            {
              title: tr("موقوف", "Offboarded"),
              value: offboardedCount,
              icon: UserX,
            },
          ]
        : []),
      {
        title: tr("مرفوض", "Rejected"),
        value: rejectedCount,
        icon: Ban,
      },
      {
        title: tr("معلّق", "Pending"),
        value: pendingCount,
        icon: Clock,
      },
      {
        title: tr("مقبول", "Approved"),
        value: approvedCount,
        icon: CheckCircle2,
      },
      {
        title: tr("إجمالي الأطباء", "Total doctors"),
        value: total,
        icon: Stethoscope,
      },
    ];
  }, [doctors, total, locale]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.specialization ||
      filters.status ||
      filters.city ||
      filters.country ||
      filters.from ||
      filters.to,
  );

  return (
    <>
      <Helmet>
        <title>{tr("إدارة الأطباء", "Doctors")} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className="mx-auto w-full max-w-[1600px] px-3 pb-6 sm:px-4 md:px-6"
      >
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("إدارة الأطباء", "Doctors management")}
          subtitle={tr(
            "عرض ومتابعة بيانات الأطباء. إيقاف وتفعيل الحسابات غير متاحين حالياً لأن مسارات هذا التدفق غير موثقة في swagger_api.md",
            "View and monitor doctor records. Offboard/reboard flows are currently unavailable because those routes are not documented in swagger_api.md",
          )}
          headerIcon={<Stethoscope className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={stats.map((c) => {
            const Icon = c.icon;
            return {
              key: c.title,
              icon: <Icon className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : c.value,
              label: c.title,
            };
          })}
        />

        <AdminSearchFiltersBar
          queryPlaceholder={tr("ابحث عن طبيب...", "Search for a doctor...")}
          specialtyPlaceholder={tr("الاختصاص", "Specialty")}
          specialtyOptions={[
            { label: tr("طب الأطفال", "Pediatrics"), value: "pediatrics" },
            { label: tr("طب الأسرة", "Family medicine"), value: "family" },
          ]}
          statusPlaceholder={tr("الحالة", "Status")}
          statusOptions={[
            { label: tr("مقبول", "Approved"), value: "approved" },
            { label: tr("معلّق", "Pending"), value: "pending" },
            { label: tr("مرفوض", "Rejected"), value: "rejected" },
          ]}
          filtersLeading={
            <div className="flex w-full min-w-0 flex-wrap content-stretch items-center gap-2 sm:gap-3">
              <input
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    city: e.target.value,
                    page: 1,
                  }))
                }
                placeholder={tr("المدينة", "City")}
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4"
              />
              <input
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value,
                    page: 1,
                  }))
                }
                placeholder={tr("الدولة", "Country")}
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3] sm:min-w-[120px] sm:flex-none sm:w-[140px] sm:px-4"
              />
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value,
                    page: 1,
                  }))
                }
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-start font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: e.target.value,
                    page: 1,
                  }))
                }
                className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-start font-cairo text-[12px] font-bold text-[#111827] sm:w-[150px] sm:flex-none sm:px-4"
              />
            </div>
          }
          onChange={(values) => {
            setFilters((prev) => ({
              ...prev,
              search: values.query ?? "",
              specialization: values.specialty ?? "",
              status: (values.status as AdminDoctorApprovalStatus) ?? "",
              page: 1,
            }));
          }}
        />

        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#E8ECEF] bg-[#F8F9FA] shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:mt-5">
          <div className="flex items-center justify-between border-b border-[#E8ECEF] bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <Stethoscope
                className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                style={{ color: TEAL }}
                aria-hidden
              />
              <div className="truncate font-cairo text-sm font-black text-[#1F2937] sm:text-[16px]">
                {tr("قائمة الأطباء", "Doctors list")} ({isAwaitingData ? "—" : results})
              </div>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isRefetching}
              className="inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              {isRefetching
                ? tr("جارٍ التحديث...", "Refreshing...")
                : tr("تحديث", "Refresh")}
            </button>
          </div>

          <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
            {isRefetching && !isAwaitingData ? (
              <div className="rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 font-cairo text-[12px] font-bold text-[#047857]">
                {tr("جارٍ تحديث قائمة الأطباء...", "Refreshing doctors list...")}
              </div>
            ) : null}
            {isAwaitingData ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <DoctorCardSkeleton key={i} index={i} />
                ))}
              </>
            ) : error ? (
              <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center">
                <div className="font-cairo text-[13px] font-semibold text-[#B42318]">
                  {userFacingErrorMessage(
                    error,
                    tr("فشل تحميل قائمة الأطباء", "Failed to load doctors list"),
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]"
                >
                  <RefreshCw className="h-4 w-4" />
                  {tr("إعادة المحاولة", "Retry")}
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="rounded-[10px] border border-[#E8ECEF] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {hasActiveFilters
                  ? tr(
                      "لا يوجد أطباء مطابقون لخيارات البحث الحالية.",
                      "No doctors match the current filters.",
                    )
                  : tr("لا يوجد أطباء حالياً.", "No doctors yet.")}
              </div>
            ) : (
              doctors.map((d) => {
                const phoneKey = phoneComparisonKey(d.user?.phone);
                return (
                  <DoctorListCard
                    key={d._id}
                    doctor={d}
                    isDuplicatePhone={
                      phoneKey != null && duplicatePhoneKeys.has(phoneKey)
                    }
                    onDetails={() =>
                      navigate(`/admin/doctors/${encodeURIComponent(d._id)}`)
                    }
                    onOffboard={undefined}
                    onReboard={undefined}
                  />
                );
              })
            )}
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-center font-cairo text-[11px] font-semibold text-[#667085] sm:text-start sm:text-[12px]">
            {tr("الصفحة", "Page")} {filters.page} {tr("من", "of")} {totalPages}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
            <StyledSelect
              className="w-full min-w-[110px] sm:w-[120px]"
              size="sm"
              tone="muted"
              value={String(filters.limit)}
              onChange={(v) => {
                const nextLimit = Number(v) || 20;
                setFilters((prev) => ({
                  ...prev,
                  limit: nextLimit,
                  page: 1,
                }));
              }}
              options={[
                {
                  value: "20",
                  label: tr("20 / صفحة", "20 / page"),
                },
                {
                  value: "50",
                  label: tr("50 / صفحة", "50 / page"),
                },
                {
                  value: "100",
                  label: tr("100 / صفحة", "100 / page"),
                },
              ]}
              listboxAriaLabel={tr(
                "عدد النتائج في الصفحة",
                "Results per page",
              )}
            />

            <button
              type="button"
              disabled={isAwaitingData || filters.page <= 1}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              className={
                isAwaitingData || filters.page <= 1
                  ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                  : "h-[38px] flex-1 rounded-[10px] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] sm:flex-none"
              }
            >
              {tr("السابق", "Previous")}
            </button>
            <button
              type="button"
              disabled={isAwaitingData || filters.page >= totalPages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              className={
                isAwaitingData || filters.page >= totalPages
                  ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                  : "h-[38px] flex-1 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(15,143,139,0.25)] sm:flex-none"
              }
            >
              {tr("التالي", "Next")}
            </button>
          </div>
        </div>

        <div className="h-4 sm:h-8" />
      </div>
    </>
  );
}
