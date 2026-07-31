"use client";

import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  ChevronLeft,
  Mail,
  Phone,
  Search,
  Stethoscope,
  Edit3,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  ADMIN_SECRETARY_BLOCKER_MESSAGE,
  ADMIN_SECRETARY_BLOCKER_TITLE,
  ADMIN_SECRETARY_WRITE_SUPPORTED,
  useAdminSecretariesList,
} from "@/hooks/admin/secretaries/useAdminSecretaries";
import { useAdminDoctors } from "@/hooks/admin/doctors/useAdminDoctors";
import CreateSecretaryDialog from "@/components/admin/secretaries/dialogs/CreateSecretaryDialog";
import EditSecretaryDialog from "@/components/admin/secretaries/dialogs/EditSecretaryDialog";
import { SecretaryCardSkeleton } from "@/components/admin/secretaries/SecretaryCardSkeleton";
import { PERM_LABEL } from "@/components/admin/secretaries/secretaryPermissions";
import { resolveUserId } from "@/components/admin/secretaries/secretaryListUtils";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import StyledSelect from "@/components/ui/styled-select";
import type { AdminSecretarySummary } from "@/lib/admin/types";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useI18n } from "@/i18n/provider";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminSecretariesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";
  const numberLocaleSa = locale === "ar" ? "ar-SA" : "en-US";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 380);
  const [doctorIdFilter, setDoctorIdFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminSecretarySummary | null>(
    null,
  );

  const { doctors: doctorOptions, isAwaitingData: doctorsListAwaiting } =
    useAdminDoctors({
      page: 1,
      limit: 100,
      status: "approved",
    });

  const { data, isAwaitingData, isError, refetch } = useAdminSecretariesList({
    search: debouncedSearch || undefined,
    doctorId: doctorIdFilter || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages =
    data && data.total > 0 ? Math.max(1, Math.ceil(data.total / LIMIT)) : 0;

  const paginationRange = useMemo(() => {
    if (!data || data.total <= 0) return { start: 0, end: 0 };
    const start = (page - 1) * LIMIT + 1;
    const end = Math.min(page * LIMIT, data.total);
    return { start, end };
  }, [data, page]);

  const showPaginationBar =
    !isAwaitingData && !isError && data && data.total > 0;

  const openEdit = useCallback((s: AdminSecretarySummary) => {
    if (!ADMIN_SECRETARY_WRITE_SUPPORTED) {
      toast(tr(ADMIN_SECRETARY_BLOCKER_MESSAGE.ar, ADMIN_SECRETARY_BLOCKER_MESSAGE.en), {
        title: tr(ADMIN_SECRETARY_BLOCKER_TITLE.ar, ADMIN_SECRETARY_BLOCKER_TITLE.en),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    setEditTarget(s);
    setEditOpen(true);
  }, [toast, tr]);

  const openCreate = useCallback(() => {
    if (!ADMIN_SECRETARY_WRITE_SUPPORTED) {
      toast(tr(ADMIN_SECRETARY_BLOCKER_MESSAGE.ar, ADMIN_SECRETARY_BLOCKER_MESSAGE.en), {
        title: tr(ADMIN_SECRETARY_BLOCKER_TITLE.ar, ADMIN_SECRETARY_BLOCKER_TITLE.en),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    setCreateOpen(true);
  }, [toast, tr]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{tr("إدارة السكرتارية", "Secretaries")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("إدارة السكرتارية", "Secretaries management")}
          subtitle={tr(
            "مراقبة حسابات السكرتيرين المرتبطين بالأطباء. تدعم لوحة الإدارة حالياً الاستعراض فقط، بينما يبقى الإنشاء والتعديل محجوبين لغياب Admin endpoints معتمدة لهذه العمليات.",
            "Monitor secretary accounts linked to doctors. The Admin area currently supports listing only, while create and edit remain blocked because approved Admin endpoints for these actions are missing.",
          )}
          headerIcon={<Users className="h-8 w-8 text-white" />}
          actionLabel={tr("إنشاء سكرتير", "Create secretary")}
          actionDisabled={!ADMIN_SECRETARY_WRITE_SUPPORTED}
          onActionClick={openCreate}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : (data?.total ?? 0).toLocaleString(numberLocale),
              label: tr("إجمالي السكرتارية", "Total secretaries"),
            },
            {
              key: "doctors",
              icon: <Stethoscope className="h-5 w-5 shrink-0" />,
              value: doctorsListAwaiting ? "—" : doctorOptions.length,
              label: tr("أطباء مرتبطون", "Linked doctors"),
            },
            {
              key: "page",
              icon: <Mail className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : (data?.results ?? 0),
              label: tr("في هذه الصفحة", "On this page"),
            },
          ]}
        />

        <div className="mt-5 flex items-center justify-between gap-16 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={tr(
                "البحث بالاسم أو البريد أو الهاتف...",
                "Search by name, email, or phone...",
              )}
              className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 pe-10 text-start font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          </div>

          <StyledSelect
            id="admin-secretary-doctor-filter"
            className="w-36 shrink-0"
            size="sm"
            tone="muted"
            value={doctorIdFilter}
            disabled={doctorsListAwaiting}
            onChange={(v) => {
              setDoctorIdFilter(v);
              setPage(1);
            }}
            placeholder={tr("كل الأطباء", "All doctors")}
            options={[
              { value: "", label: tr("كل الأطباء", "All doctors") },
              ...doctorOptions.map((d) => ({
                value: d._id,
                label: `${d.user?.fullName ?? d._id}${d.specialization ? ` — ${d.specialization}` : ""}`,
              })),
            ]}
            listboxAriaLabel={tr("تصفية حسب الطبيب", "Filter by doctor")}
          />
          {doctorOptions.length >= 200 ? (
            <p className="mt-1.5 text-start font-cairo text-[10px] font-semibold text-[#98A2B3]">
              {tr(
                "عُرضت أول 200 طبيب معتمد. استخدم البحث أعلاه لتضييق السكرتيرين.",
                "Showing the first 200 approved doctors. Use search above to narrow secretaries.",
              )}
            </p>
          ) : null}
        </div>

        <div className="mt-5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4">
          <div className="font-cairo text-[12px] font-extrabold text-[#991B1B]">
            {tr(
              ADMIN_SECRETARY_BLOCKER_MESSAGE.ar,
              ADMIN_SECRETARY_BLOCKER_MESSAGE.en,
            )}
          </div>
        </div>

        <section className="mt-5 space-y-4">
          {isAwaitingData ? (
            <>
              <SecretaryCardSkeleton />
              <SecretaryCardSkeleton />
              <SecretaryCardSkeleton />
            </>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] px-6 py-10 text-center">
              <AlertCircle className="h-7 w-7 text-[#DC2626]" />
              <div className="font-cairo text-[14px] font-extrabold text-[#991B1B]">
                {tr("تعذّر تحميل البيانات", "Failed to load data")}
              </div>
              <button
                onClick={() => refetch()}
                className="mt-1 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]"
              >
                {tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : data?.secretaries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-16 text-center">
              <Users className="h-10 w-10 text-[#D0D5DD]" />
              <div className="font-cairo text-[14px] font-extrabold text-[#667085]">
                {debouncedSearch
                  ? tr(
                      "لا توجد نتائج مطابقة للبحث",
                      "No results match your search",
                    )
                  : tr(
                      "لا يوجد سكرتيرون مسجلون",
                      "No secretaries registered",
                    )}
              </div>
            </div>
          ) : (
            data?.secretaries.map((s) => {
              const userId = resolveUserId(s);
              const perms = s.permissions ?? [];

              return (
                <div
                  key={s._id}
                  className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.09)]"
                >
                  <div className="px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="text-start">
                          <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                            {s.user?.fullName ?? "—"}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            {tr("سكرتير", "Secretary")}
                            {s.doctor?.user?.fullName
                              ? ` • ${s.doctor.user.fullName}`
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          title={tr("تعديل البيانات", "Edit details")}
                          disabled={!ADMIN_SECRETARY_WRITE_SUPPORTED}
                          className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {tr("تعديل", "Edit")}
                        </button>
                        {userId && (
                          <span className="flex h-8 items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-cairo text-[11px] font-extrabold text-[#667085]">
                            {tr("إيقاف غير متاح", "Offboard unavailable")}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/secretaries/${s._id}`, {
                              state: { secretary: s },
                            })
                          }
                          title={tr("ملف السكرتير", "Secretary profile")}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-white shadow-sm transition hover:bg-primary/90"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      {s.user?.phone && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Phone className="h-4 w-4 text-primary" />
                          {s.user.phone}
                        </div>
                      )}
                      {s.user?.email && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Mail className="h-4 w-4 text-primary" />
                          {s.user.email}
                        </div>
                      )}
                    </div>

                    {s.doctor && (
                      <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] px-5 py-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Stethoscope className="h-4 w-4" />
                          <span className="font-cairo text-[12px] font-extrabold">
                            {tr("الطبيب المسؤول", "Assigned doctor")}
                          </span>
                        </div>
                        <div className="text-start">
                          <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                            {s.doctor.user?.fullName ?? "—"}
                          </div>
                          {s.doctor.specialization && (
                            <div className="mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]">
                              {s.doctor.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {perms.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 font-cairo text-[11px] font-extrabold text-[#98A2B3]">
                          {tr("الصلاحيات", "Permissions")} ({perms.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="rounded-full border border-[#E0F2FE] bg-[#F0F9FF] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#0369A1]"
                            >
                              {PERM_LABEL[p] ?? p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments`,
                              {
                                state: { secretary: s },
                              },
                            )
                          }
                          className="h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]"
                        >
                          {tr("عرض المواعيد", "View appointments")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments/manage`,
                              { state: { secretary: s } },
                            )
                          }
                          className="h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]"
                        >
                          {tr("إدارة المواعيد", "Manage appointments")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {showPaginationBar ? (
          <DoctorTablePagination
            page={page}
            totalPages={totalPages}
            pageSize={LIMIT}
            pageSizeOptions={[10, 20, 50]}
            summaryLabel={tr(
              `عرض ${paginationRange.start.toLocaleString(numberLocaleSa)}–${paginationRange.end.toLocaleString(numberLocaleSa)} من ${data!.total.toLocaleString(numberLocaleSa)} سكرتيراً`,
              `Showing ${paginationRange.start.toLocaleString(numberLocaleSa)}–${paginationRange.end.toLocaleString(numberLocaleSa)} of ${data!.total.toLocaleString(numberLocaleSa)} secretaries`,
            )}
            onPageChange={setPage}
            onPageSizeChange={() => {
              setPage(1);
            }}
          />
        ) : null}

        <div className="h-8" />
      </div>

      <CreateSecretaryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch()}
      />

      <EditSecretaryDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        secretary={editTarget}
        onSuccess={() => refetch()}
      />
    </>
  );
}
