import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  isAwaitingAnyInitialQueryData,
  isAwaitingInitialQueryDataWithPlaceholder,
} from "@/lib/query/queryUi";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/motion";
import { adminApi } from "@/lib/admin/client";
import { complaintUserFacingError } from "@/lib/admin/complaints/complaintErrors";
import StyledSelect from "@/components/ui/styled-select";
import type {
  ComplaintLifecycleStatus,
  ComplaintType,
} from "@/lib/admin/types";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  COMPLAINT_TYPES,
  complaintTypeAr,
  formatListTime,
  listPreviewLine,
  statusBadgeClasses,
  statusLabelAr,
} from "@/components/admin/complaints/complaintsListUtils";
import { ComplaintCardSkeleton } from "@/components/admin/skeletons/ComplaintCardSkeleton";
import { Pagination } from "@/components/admin/services/Pagination";
import { useI18n } from "@/i18n/provider";

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ComplaintLifecycleStatus
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ComplaintType>("all");

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      350,
    );
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  const countQueries = useQueries({
    queries: [
      {
        queryKey: ["admin", "complaints", "count", "all"],
        queryFn: () => adminApi.complaints.list({ page: 1, limit: 1 }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin", "complaints", "count", "under_review"],
        queryFn: () =>
          adminApi.complaints.list({
            page: 1,
            limit: 1,
            status: "under_review",
          }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin", "complaints", "count", "in_progress"],
        queryFn: () =>
          adminApi.complaints.list({
            page: 1,
            limit: 1,
            status: "in_progress",
          }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin", "complaints", "count", "resolved"],
        queryFn: () =>
          adminApi.complaints.list({ page: 1, limit: 1, status: "resolved" }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin", "complaints", "count", "closed"],
        queryFn: () =>
          adminApi.complaints.list({ page: 1, limit: 1, status: "closed" }),
        staleTime: 30_000,
      },
    ],
  });

  const submittedPreview = useQuery({
    queryKey: ["admin", "complaints", "first-submitted"],
    queryFn: () =>
      adminApi.complaints.list({ status: "submitted", page: 1, limit: 1 }),
    staleTime: 25_000,
  });

  const listQuery = useQuery({
    queryKey: [
      "admin",
      "complaints",
      "list",
      page,
      limit,
      statusFilter,
      typeFilter,
      debouncedSearch,
    ],
    queryFn: () =>
      adminApi.complaints.list({
        page,
        limit,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const stats = useMemo(() => {
    const total = countQueries[0].data?.total ?? 0;
    const review =
      (countQueries[1].data?.total ?? 0) + (countQueries[2].data?.total ?? 0);
    const closed =
      (countQueries[3].data?.total ?? 0) + (countQueries[4].data?.total ?? 0);
    return { total, review, closed };
  }, [countQueries]);

  const countsAwaiting = isAwaitingAnyInitialQueryData(
    countQueries.map((q) => ({ data: q.data, isError: q.isError })),
  );
  const listAwaiting = isAwaitingInitialQueryDataWithPlaceholder(
    listQuery.data,
    listQuery.isError,
    undefined,
  );

  const complaints = listQuery.data?.complaints ?? [];
  const listErrorMessage = listQuery.isError
    ? complaintUserFacingError(
        listQuery.error,
        tr("تعذر تحميل قائمة الشكاوى.", "Failed to load complaints list."),
      )
    : null;
  const totalList = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalList / Math.max(limit, 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const hasActiveFilters =
    debouncedSearch.length > 0 || statusFilter !== "all" || typeFilter !== "all";

  const bannerName =
    submittedPreview.data?.complaints?.[0]?.contactSnapshot?.fullName;
  const showNewBanner = (submittedPreview.data?.total ?? 0) > 0;

  return (
    <>
      <Helmet>
        <title>{tr("الشكاوي", "Complaints")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="text-start">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("الشكاوي", "Complaints")}
          subtitle={tr(
            "متابعة شكاوى المرضى ومعالجة طلبات الدعم",
            "Track patient complaints and support requests",
          )}
          headerIcon={<MessageSquare className="h-8 w-8 text-white" />}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <MessageSquare className="h-5 w-5 shrink-0" />,
              value: countsAwaiting ? "—" : stats.total,
              label: tr("إجمالي الشكاوي", "Total complaints"),
            },
            {
              key: "review",
              icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
              value: countsAwaiting ? "—" : stats.review,
              label: tr("قيد المراجعة", "Under review"),
            },
            {
              key: "closed",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: countsAwaiting ? "—" : stats.closed,
              label: tr("مغلقة", "Closed"),
            },
          ]}
        />

        {showNewBanner && bannerName ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.05, ease: "easeOut" }}
            className="mt-6 flex items-start gap-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4 shadow-[0_12px_32px_rgba(249,115,22,0.12)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F97316] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)]">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <p className="min-w-0 pt-0.5 font-cairo text-[14px] font-bold leading-relaxed text-[#9A3412]">
              {tr(
                "يوجد شكوى جديدة (حالة مقدّمة) مقدمة من المريض",
                "There is a new complaint (submitted) from patient",
              )}{" "}
              <span className="font-black text-[#7C2D12]">{bannerName}</span>.
            </p>
          </motion.section>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.12 }}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between"
        >
          <div className="relative min-w-0 flex-1 md:max-w-md">
            <input
              type="search"
              value={searchInput}
              disabled={listAwaiting}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={tr(
                "بحث (اسم، بريد، موضوع، النص...)",
                "Search (name, email, subject, text...)",
              )}
              className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-3 pr-11 font-cairo text-[13px] font-medium text-[#111827] placeholder:text-[#94A3B8] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[#64748B]">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-cairo text-[12px] font-extrabold">
                {tr("تصفية", "Filter")}
              </span>
            </span>
            <StyledSelect
              className="h-10 min-w-[160px]"
              size="sm"
              tone="muted"
              value={statusFilter}
              disabled={listAwaiting}
              onChange={(v) =>
                setStatusFilter(v as "all" | ComplaintLifecycleStatus)
              }
              options={[
                { value: "all", label: tr("الحالة — الكل", "Status — all") },
                { value: "submitted", label: tr("مقدّمة", "Submitted") },
                {
                  value: "under_review",
                  label: tr("قيد المراجعة", "Under review"),
                },
                {
                  value: "in_progress",
                  label: tr("قيد المعالجة", "In progress"),
                },
                { value: "resolved", label: tr("تم الحل", "Resolved") },
                { value: "closed", label: tr("مغلقة", "Closed") },
              ]}
              listboxAriaLabel={tr(
                "تصفية حالة الشكوى",
                "Filter complaint status",
              )}
            />
            <StyledSelect
              className="h-10 min-w-[180px]"
              size="sm"
              tone="muted"
              value={typeFilter}
              disabled={listAwaiting}
              onChange={(v) => setTypeFilter(v as "all" | ComplaintType)}
              options={[
                {
                  value: "all",
                  label: tr("نوع الشكوى — الكل", "Complaint type — all"),
                },
                ...COMPLAINT_TYPES.map((t) => ({
                  value: t,
                  label: complaintTypeAr(t),
                })),
              ]}
              listboxAriaLabel={tr("تصفية نوع الشكوى", "Filter complaint type")}
            />
          </div>
        </motion.div>

        {listQuery.isRefetching && !listAwaiting ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {tr("جارٍ تحديث النتائج...", "Refreshing results...")}
          </div>
        ) : null}

        {listQuery.isError ? (
          <div className="mt-8 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-center shadow-[0_8px_24px_rgba(127,29,29,0.08)]">
            <p className="font-cairo text-sm font-semibold text-red-600">
              {listErrorMessage ??
                tr(
                  "تعذر تحميل قائمة الشكاوى.",
                  "Failed to load complaints list.",
                )}
            </p>
            <button
              type="button"
              onClick={() => void listQuery.refetch()}
              className="mt-3 inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]"
            >
              <RefreshCw className="h-4 w-4" />
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : listAwaiting ? (
          <motion.ul
            variants={staggerContainer(0.07, 0.06)}
            initial="hidden"
            animate="show"
            className="mt-6 flex list-none flex-col gap-4 p-0"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.li key={i} variants={staggerItem} className="block">
                <ComplaintCardSkeleton index={i} />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <>
            <motion.ul
              variants={staggerContainer(0.07, 0.06)}
              initial="hidden"
              animate="show"
              className="mt-6 flex list-none flex-col gap-4 p-0"
            >
              {complaints.map((c) => (
                <motion.li key={c._id} variants={staggerItem} className="block">
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/admin/complaints/${c._id}`)}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.998 }}
                    transition={{ duration: 0.2 }}
                    className="flex w-full cursor-pointer items-stretch gap-0 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white text-start shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(15,23,42,0.09)]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 text-start">
                            <div className="font-cairo text-[17px] font-black text-[#0F172A]">
                              {c.contactSnapshot?.fullName ?? "—"}
                            </div>
                            <div className="mt-1 font-cairo text-[18px] font-semibold leading-[22px] text-primary">
                              {tr("نوع الشكوى:", "Complaint type:")}{" "}
                              <span className="text-[#1F2937]">
                                {complaintTypeAr(c.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex h-[23px] shrink-0 items-center rounded-[6px] border-[1.82px] px-2 py-1 font-cairo text-[12px] font-semibold leading-[16px] ${statusBadgeClasses(
                            c.status,
                          )}`}
                        >
                          {statusLabelAr(c.status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-start justify-between gap-2 ms-0 sm:ms-[80px]">
                        <div className="flex min-w-0 items-start gap-1.5 font-cairo text-[15px] font-semibold text-[#4A5565]">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="break-words">
                            {listPreviewLine(c)}
                          </span>
                        </div>
                        <div className="shrink-0 font-cairo text-[14px] font-bold text-[#99A1AF]">
                          {formatListTime(c.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex w-[56px] shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-[#3e8f89]">
                      <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                    </div>
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>

            {complaints.length === 0 ? (
              <p className="mt-8 text-center font-cairo text-sm font-semibold text-[#94A3B8]">
                {hasActiveFilters
                  ? tr(
                      "لا توجد شكاوى مطابقة للفلاتر أو البحث الحالي.",
                      "No complaints match the current filters or search.",
                    )
                  : tr("لا توجد شكاوى حتى الآن.", "No complaints yet.")}
              </p>
            ) : null}

            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
    </>
  );
}
