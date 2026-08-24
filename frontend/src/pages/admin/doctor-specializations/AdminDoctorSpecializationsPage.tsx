import { Helmet } from "react-helmet-async";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  FileSpreadsheet,
  Loader2,
  Plus,
  Pencil,
  RefreshCw,
  Search,
  Stethoscope,
  Tags,
  Trash2,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import ConfirmActionDialog from "@/components/admin/dialogs/ConfirmActionDialog";
import UpsertDoctorLookupDialog from "@/components/admin/doctor-specializations/UpsertDoctorLookupDialog";
import { DoctorSpecializationCardSkeleton } from "@/components/admin/skeletons/DoctorSpecializationCardSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import { useAdminLookups } from "@/hooks/admin/lookups/useAdminLookups";
import { useRemoveLookup } from "@/hooks/admin/lookups/useAdminLookupMutations";
import {
  resolveLookupSecondaryText,
  resolveLookupText,
} from "@/lib/admin/lookups/lookupUtils";
import { resolveDoctorSpecialtyLookupCategory } from "@/lib/admin/doctors/doctorSpecialtyLookupCategory";
import type { AdminLookupRecord } from "@/lib/admin/types";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { staggerContainer, staggerItem } from "@/motion";
import { ApiError } from "@/lib/api";
import { downloadUtf8Csv } from "@/lib/export/downloadUtf8Csv";
import { Pagination } from "@/components/admin/services/Pagination";
import { useI18n } from "@/i18n/provider";

const PAGE_SIZE = 9;

export default function AdminDoctorSpecializationsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [langOnly, setLangOnly] = useState(true);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminLookupRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminLookupRecord | null>(
    null,
  );

  const lookupCategory = resolveDoctorSpecialtyLookupCategory();

  const listParams = useMemo(
    () => ({
      category: lookupCategory,
      includeInactive,
      langOnly,
    }),
    [lookupCategory, includeInactive, langOnly],
  );

  const { data, isAwaitingData, error, refetch } = useAdminLookups(listParams);
  const { retry: retryLookups, retrying: retryingLookups } = useRetryAction(
    () => refetch(),
  );
  const removeMut = useRemoveLookup();

  const lookups = data?.lookups ?? [];

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    const rows = [...lookups];
    rows.sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.key.localeCompare(b.key, "en"),
    );
    if (!q) return rows;
    return rows.filter((row) => {
      const ar = resolveLookupText(row.text, "ar");
      const en = resolveLookupText(row.text, "en");
      const alt = resolveLookupSecondaryText(row.text, "ar");
      const hay = `${row.key} ${ar} ${en} ${alt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [lookups, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, includeInactive, langOnly]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeCount = lookups.filter((x) => x.isActive).length;
  const inactiveCount = lookups.filter((x) => !x.isActive).length;

  const busy = isAwaitingData;
  const hasActiveFilters = deferredSearch.length > 0 || includeInactive || !langOnly;

  function openCreate() {
    setEditTarget(null);
    setUpsertOpen(true);
  }

  function openEdit(row: AdminLookupRecord) {
    setEditTarget(row);
    setUpsertOpen(true);
  }

  function exportFilteredTableToExcel() {
    if (filtered.length === 0) return;
    const headers = [
      tr("المفتاح", "Key"),
      tr("الترتيب", "Order"),
      tr("الحالة", "Status"),
      tr("الاسم بالعربية", "Arabic name"),
      tr("الاسم بالإنجليزية", "English name"),
      tr("المعرف", "ID"),
    ];
    const rows = filtered.map((row) => {
      const titleAr = resolveLookupText(row.text, "ar");
      const titleEn = resolveLookupText(row.text, "en");
      return [
        row.key,
        String(row.order ?? 0),
        row.isActive ? tr("نشط", "Active") : tr("غير نشط", "Inactive"),
        titleAr || titleEn || row.key,
        titleEn || "",
        row._id,
      ];
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadUtf8Csv(`lmj-takhasosat-atibba-${stamp}.csv`, headers, rows);
  }

  const apiErrMsg =
    error != null
      ? error instanceof ApiError
        ? userFacingErrorMessage(error)
        : tr("تعذّر تحميل الكتالوج.", "Failed to load catalog.")
      : null;

  return (
    <>
      <Helmet>
        <title>{tr("تخصصات الأطباء", "Doctor specializations")} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className="mx-auto w-full max-w-[1600px] px-3 pb-10 sm:px-4 md:px-6"
      >
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("تخصصات الأطباء", "Doctor specializations")}
          subtitle={tr(
            "إدارة كتالوج التخصصات الطبية في الإدارة وكتالوج التسجيل",
            "Manage the medical specialization catalog for admin and registration",
          )}
          headerIcon={<Tags className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة تخصص", "Add specialization")}
          onActionClick={openCreate}
          kpiColumns={3}
          kpis={[
            {
              key: "total",
              icon: <Tags className="h-5 w-5 shrink-0" />,
              value: busy ? "…" : lookups.length,
              label: tr("عناصر الكتالوج", "Catalog items"),
            },
            {
              key: "active",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: busy ? "…" : activeCount,
              label: tr("نشطة", "Active"),
            },
            {
              key: "inactive",
              icon: <Tags className="h-5 w-5 shrink-0" />,
              value: busy ? "…" : inactiveCount,
              label: tr("غير نشطة", "Inactive"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه الصفحة مخصّصة لإدارة كتالوج تخصصات الأطباء المرجعي المستخدم في التسجيل ولوحات الإدارة، وليست لإدارة تخصص طبيب بعينه من ملفه الشخصي. أي تعديل هنا ينعكس على خيارات الاختيار المرجعية في النظام كله.",
              "This page is for managing the reference doctor-specialization catalog used in signup and admin flows, not for editing one specific doctor’s specialty from their profile. Any change here affects the system-wide reference options.",
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2 items-center justify-end">
          <button
            type="button"
            onClick={exportFilteredTableToExcel}
            disabled={busy || filtered.length === 0}
            className="inline-flex h-[40px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)] transition hover:border-primary/40 disabled:opacity-50"
            title={tr(
              "ملف CSV يفتح كجدول في Microsoft Excel",
              "CSV file opens as a table in Microsoft Excel",
            )}
          >
            <FileSpreadsheet className="h-4 w-4 text-[#16A34A]" aria-hidden />
            {tr("جدول Excel", "Excel table")}
          </button>
          <button
            type="button"
            onClick={() => void retryLookups()}
            disabled={retryingLookups}
            className="inline-flex h-[40px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)] transition hover:border-primary/40 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${retryingLookups ? "animate-spin" : ""}`}
              aria-hidden
            />
            {tr("تحديث", "Refresh")}
          </button>
          <Link
            to="/admin/doctors"
            className="inline-flex h-[40px] items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_22px_rgba(0,0,0,0.05)] transition hover:border-primary/40 hover:text-primary"
          >
            {tr("قائمة الأطباء", "Doctors list")}
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {retryingLookups && !busy ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
            {tr("جارٍ تحديث الكتالوج...", "Refreshing catalog...")}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-[#E8ECEF] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <label className="relative flex min-w-[200px] flex-1 items-center">
            <Search
              className="pointer-events-none absolute end-3 h-4 w-4 text-[#98A2B3]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr(
                "ابحث بالمفتاح أو الاسم العربي أو الإنجليزي…",
                "Search by key, Arabic name, or English name…",
              )}
              className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] py-2 pe-10 ps-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/0 transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/12"
            />
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            {tr("عرض العناصر المعطّلة", "Show disabled items")}
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40"
              checked={langOnly}
              onChange={(e) => setLangOnly(e.target.checked)}
            />
            {tr("نص اللغة الحالية فقط", "Current language text only")}
          </label>
        </div>

        {isAwaitingData ? (
          <SkeletonList
            count={9}
            SkeletonComponent={DoctorSpecializationCardSkeleton}
            className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 xl:grid-cols-3"
          />
        ) : apiErrMsg ? (
          <div className="mt-8 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-12 text-center">
            <p className="font-cairo text-[13px] font-bold text-[#B42318]">
              {apiErrMsg}
            </p>
            <button
              type="button"
              onClick={() => void retryLookups()}
              className="mt-4 inline-flex h-[40px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-[14px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-6 py-16 text-center">
            <p className="font-cairo text-[14px] font-bold text-[#475467]">
              {hasActiveFilters
                ? tr(
                    "لا توجد عناصر مطابقة للبحث أو الفلاتر الحالية.",
                    "No items match the current search or filters.",
                  )
                : tr(
                    "الكتالوج فارغ حالياً.",
                    "The catalog is currently empty.",
                  )}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white"
            >
              <Plus className="w-4 h-4" />
              {tr("إضافة أول تخصص", "Add first specialization")}
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.ul
                key={safePage}
                role="list"
                className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 xl:grid-cols-3"
                variants={staggerContainer(0.055, 0.03)}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0.65 }}
              >
                {pageRows.map((row) => {
                  const titleAr = resolveLookupText(row.text, "ar");
                  const titleEn = resolveLookupText(row.text, "en");
                  const filterLink = `/admin/doctors?specialization=${encodeURIComponent(titleAr || titleEn || row.key)}`;
                  return (
                    <motion.li
                      key={row._id}
                      variants={staggerItem}
                      layout
                      className="h-full group"
                    >
                      <div className="relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-[14px] border border-[#E8ECEF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_26px_52px_rgba(15,143,139,0.14)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-primary/90 via-[#2DD4BF]/90 to-transparent opacity-90" />

                        <div className="flex flex-col flex-1 gap-3 p-4">
                          <div className="flex flex-wrap gap-2 justify-between items-start">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${
                                row.isActive
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                  : "bg-[#F3F4F6] text-[#64748B] ring-1 ring-[#E5E7EB]"
                              }`}
                            >
                              {row.isActive
                                ? tr("نشط", "Active")
                                : tr("غير نشط", "Inactive")}
                            </span>
                            <span className="rounded-full bg-[#F0FDFA] px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-[#CCFBF1]">
                              #{row.order ?? 0}
                            </span>
                          </div>

                          <div className="min-w-0 text-start">
                            <h2 className="font-cairo text-[15px] font-extrabold leading-snug text-[#111827]">
                              {titleAr || titleEn || row.key}
                            </h2>
                            <p
                              dir="ltr"
                              className="mt-1 font-cairo text-[12px] font-semibold leading-snug text-[#64748B]"
                            >
                              {titleEn || "—"}
                            </p>
                            <p
                              dir="ltr"
                              className="mt-2 truncate font-mono text-[11px] font-semibold text-[#98A2B3] text-end"
                            >
                              key: {row.key}
                            </p>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#F2F4F7] pt-3">
                            <Link
                              to={filterLink}
                              className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-1 rounded-[10px] bg-[#ECFEFF] px-3 py-2 font-cairo text-[11px] font-extrabold text-primary ring-1 ring-[#CFFAFE] transition hover:bg-[#DCFDFD]"
                            >
                              {tr("أطباء مطابقون", "Matching doctors")}
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#475467] shadow-sm transition hover:border-primary/35 hover:text-primary"
                              aria-label={tr("تعديل", "Edit")}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(row)}
                              className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#FEE2E2] bg-[#FFF7F7] text-[#DC2626] transition hover:bg-[#FEF2F2]"
                              aria-label={tr("تعطيل", "Disable")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#F2F4F7] pt-6 sm:flex-row">
              <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                {tr("عرض", "Showing")}{" "}
                <span className="tabular-nums font-bold text-[#111827]">
                  {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
                  {(safePage - 1) * PAGE_SIZE + pageRows.length}
                </span>{" "}
                {tr("من", "of")}{" "}
                <span className="font-bold text-[#111827]">
                  {filtered.length.toLocaleString(numberLocale)}
                </span>{" "}
                {tr("عنصراً مطابقاً", "matching items")}
              </p>

              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          </>
        )}
      </div>

      <UpsertDoctorLookupDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        category={lookupCategory}
        editTarget={editTarget}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant="destructive"
        title={tr("تعطيل عنصر التخصص", "Disable specialization item")}
        icon={<Trash2 className="w-6 h-6" strokeWidth={2} aria-hidden />}
        description={
          deleteTarget ? (
            <>
              {tr("سيتم استدعاء", "Will call")}{" "}
              <span className="font-mono text-[11px]">
                DELETE /api/admin/lookups/:id
              </span>{" "}
              {tr("(تعطيل ناعم). العنصر:", "(soft delete). Item:")}{" "}
              <strong>{resolveLookupText(deleteTarget.text, locale)}</strong>
            </>
          ) : null
        }
        cancelLabel={tr("إلغاء", "Cancel")}
        confirmLabel={
          removeMut.isPending
            ? tr("جاري التعطيل…", "Disabling…")
            : tr("تأكيد التعطيل", "Confirm disable")
        }
        confirmDisabled={removeMut.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await removeMut.mutateAsync(deleteTarget._id);
          setDeleteTarget(null);
        }}
        successToast={{
          title: tr("تم", "Done"),
          message: tr("عُطّل عنصر الكتالوج.", "Catalog item disabled."),
          variant: "success",
        }}
      />
    </>
  );
}
