import { Helmet } from "react-helmet-async";
import {
  Activity,
  Ban,
  Eye,
  Info,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import SuspendAccountDialog from "@/components/admin/patients/dialogs/SuspendAccountDialog";
import {
  patientStatusLabel,
  patientStatusTone,
} from "@/components/admin/patients/patientListUtils";
import { AppCheckbox } from "@/components/ui";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { useAdminPatients } from "@/hooks/admin/patients/useAdminPatients";
import { adminApi } from "@/lib/admin/client";
import type {
  AdminPatientSummary,
  AdminPatientsAccountStatusFilter,
} from "@/lib/admin/types";
import { PatientCardSkeleton } from "@/components/admin/skeletons/PatientCardSkeleton";
import { useI18n } from "@/i18n/provider";

type AdminPatientsFiltersState = {
  account_status: AdminPatientsAccountStatusFilter;
  search: string;
  includeDeleted: boolean;
  page: number;
  limit: number;
};

export default function AdminPatientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [selectedPatientLabel, setSelectedPatientLabel] = useState("");
  const [accountActionTarget, setAccountActionTarget] = useState<{
    id: string;
    label: string;
    action: "activate" | "unsuspend";
  } | null>(null);
  const [accountActionBusy, setAccountActionBusy] = useState(false);

  const defaultFilters = useMemo<AdminPatientsFiltersState>(
    () => ({
      account_status: "all",
      search: "",
      includeDeleted: false,
      page: 1,
      limit: 20,
    }),
    [],
  );

  const [filters, setFilters] = useState<AdminPatientsFiltersState>({
    ...defaultFilters,
  });

  const { patients, results, total, isAwaitingData, isRefetching, error, refetch } =
    useAdminPatients({
      account_status: filters.account_status,
      search: filters.search || undefined,
      includeDeleted: filters.includeDeleted,
      page: filters.page,
      limit: filters.limit,
    });

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const hasActiveFilters = useMemo(
    () =>
      filters.account_status !== defaultFilters.account_status ||
      Boolean(filters.search.trim()) ||
      filters.includeDeleted !== defaultFilters.includeDeleted ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit,
    [defaultFilters, filters],
  );

  async function runAccountAction() {
    if (!accountActionTarget) return;
    setAccountActionBusy(true);
    try {
      if (accountActionTarget.action === "activate") {
        await adminApi.patients.activate(accountActionTarget.id);
      } else {
        await adminApi.patients.unsuspend(accountActionTarget.id);
      }

      await refetch();
      toast(
        accountActionTarget.action === "activate"
          ? tr(
              `تم تفعيل حساب المريض «${accountActionTarget.label}».`,
              `Patient account "${accountActionTarget.label}" was activated.`,
            )
          : tr(
              `تم رفع التعليق عن حساب «${accountActionTarget.label}».`,
              `Suspension lifted for "${accountActionTarget.label}".`,
            ),
        {
          title:
            accountActionTarget.action === "activate"
              ? tr("تم التفعيل", "Activated")
              : tr("تم رفع التعليق", "Unsuspended"),
          variant: "success",
          durationMs: 4200,
        },
      );
    } finally {
      setAccountActionBusy(false);
      setAccountActionTarget(null);
    }
  }

  return (
    <>
      <Helmet>
        <title>{tr("إدارة المرضى", "Patients")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="patients"
          surface="mint"
          title={tr("إدارة المرضى", "Patients management")}
          subtitle={tr(
            "إدارة ومراقبة حسابات المرضى",
            "Manage and monitor patient accounts",
          )}
          headerIcon={<Users className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : total,
              label: tr("إجمالي المرضى", "Total patients"),
            },
            {
              key: "page",
              icon: <Activity className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : results,
              label: tr("في هذه الصفحة", "On this page"),
            },
            {
              key: "pages",
              icon: <Mail className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : totalPages,
              label: tr("عدد الصفحات", "Pages"),
            },
          ]}
        />

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#98A2B3]">
                <Filter className="w-4 h-4" />
              </div>

              <div className="min-w-0 lg:w-[180px]">
                <StyledSelect
                  size="sm"
                  tone="muted"
                  value={filters.account_status}
                  onChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      account_status:
                        (v as AdminPatientsAccountStatusFilter) || "all",
                      page: 1,
                    }))
                  }
                  options={[
                    { value: "all", label: tr("جميع الحالات", "All statuses") },
                    { value: "active", label: tr("نشط", "Active") },
                    { value: "temporary", label: tr("مؤقت", "Temporary") },
                    { value: "suspended", label: tr("معلق", "Suspended") },
                    { value: "locked", label: tr("موقوف", "Locked") },
                  ]}
                  listboxAriaLabel={tr("حالة الحساب", "Account status")}
                />
              </div>

              <label className="flex h-[42px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]">
                <AppCheckbox
                  size="sm"
                  checked={filters.includeDeleted}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      includeDeleted: e.target.checked,
                      page: 1,
                    }))
                  }
                />
                {tr("إظهار المحذوفين", "Show deleted")}
              </label>
            </div>

            <div className="relative flex-1">
              <input
                placeholder={tr(
                  "البحث بالاسم / الإيميل / الهاتف / رقم المريض...",
                  "Search by name / email / phone / patient ID...",
                )}
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
              />
              <div className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                <Search className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={!hasActiveFilters}
                onClick={() => setFilters({ ...defaultFilters })}
                className={
                  !hasActiveFilters
                    ? "inline-flex h-[42px] cursor-not-allowed items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]"
                    : "inline-flex h-[42px] items-center justify-center rounded-[10px] border border-primary/25 bg-primary/10 px-4 font-cairo text-[12px] font-extrabold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/20"
                }
              >
                {tr("مسح الفلاتر", "Clear filters")}
              </button>

              <div className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#667085]">
                {results} {tr("نتيجة", "results")}
              </div>

              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isRefetching}
                className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                {isRefetching
                  ? tr("جارٍ التحديث...", "Refreshing...")
                  : tr("تحديث", "Refresh")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3 text-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {tr(
                  "صلاحيات الإدارة هنا تركز على المتابعة وحالة الحساب",
                  "Admin actions here focus on monitoring and account status",
                )}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                {tr(
                  "يمكن من هذه الصفحة عرض التفاصيل، تعليق الحساب، أو إعادة التفعيل عند الحاجة. أما إدارة ملف المريض الطبي والملفات الحساسة فليست جزءًا من هذه القائمة.",
                  "From this page, admins can open details, suspend accounts, or reactivate them when needed. Medical record management and sensitive patient files are intentionally outside this list view.",
                )}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                {tr(
                  "تُستخدم البطاقات هنا كمدخل إلى السجل الإداري المختصر للمريض وحالة الحساب فقط، بينما تبقى أي مراجعة أوسع للبيانات أو النشاط داخل صفحة التفاصيل الخاصة به.",
                  "The cards here act only as an entry point to the patient’s short admin record and account state, while any broader review of data or activity stays inside the patient details page.",
                )}
              </div>
            </div>
          </div>
        </section>

        {isRefetching && !isAwaitingData ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {tr("جارٍ تحديث قائمة المرضى...", "Refreshing patients list...")}
          </div>
        ) : null}

        <section className="mt-5 space-y-5">
          {isAwaitingData ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <PatientCardSkeleton key={i} index={i} />
              ))}
            </>
          ) : error ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 font-cairo text-[12px] font-semibold text-[#B42318] shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  {tr("تعذر تحميل قائمة المرضى.", "Failed to load patients list.")}
                </div>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isRefetching}
                  className="inline-flex h-[34px] items-center justify-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[11px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                  {isRefetching
                    ? tr("جارٍ إعادة المحاولة...", "Retrying...")
                    : tr("إعادة المحاولة", "Retry")}
                </button>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
                <Users className="h-5 w-5" />
              </div>
              <div className="mt-3 font-cairo text-[13px] font-extrabold text-[#344054]">
                {tr("لا توجد نتائج مطابقة.", "No matching results.")}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {hasActiveFilters
                  ? tr(
                      "جرّب مسح الفلاتر أو توسيع البحث لعرض مرضى أكثر.",
                      "Try clearing filters or broadening the search to show more patients.",
                    )
                  : tr(
                      "لا توجد بيانات مرضى ظاهرة ضمن النطاق الحالي.",
                      "No patient data is visible within the current scope.",
                    )}
              </div>
            </div>
          ) : (
            patients.map((p) => {
              const tone = patientStatusTone(p.user.accountStatus);
              const actionKind =
                p.user.accountStatus === "suspended" ? "unsuspend" : "activate";

              return (
                <div
                  key={p._id}
                  className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex">
                    <div className="flex-1 px-6 py-5">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-primary text-white">
                            <Users className="w-6 h-6" />
                          </div>

                          <div className="text-start">
                            <div className="font-cairo text-[16px] font-black leading-[20px] text-[#111827]">
                              {p.user.fullName}
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                              {p.publicId}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div
                            className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${tone.chip}`}
                          >
                            {patientStatusLabel(p.user.accountStatus, locale)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="mt-4 rounded-[10px] bg-[#F9FAFB] px-4 py-3">
                          <div className="flex flex-col gap-2 justify-start items-start">
                            <div className="flex items-center justify-start gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                              <Phone className="w-4 h-4 text-primary" />
                              {p.user.phone ?? "—"}
                            </div>
                            <div className="flex items-center justify-start gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                              <Mail className="w-4 h-4 text-primary" />
                              {p.user.email ?? "—"}
                            </div>
                          </div>
                        </div>
                        <div className="border-[#EEF2F6] bg-white px-5">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/patients/${encodeURIComponent(p._id)}`,
                                  {
                                    state: {
                                      patient: p satisfies AdminPatientSummary,
                                    },
                                  },
                                )
                              }
                              className="flex h-[34px] w-[150px] bg-primary items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] font-cairo text-[12px] font-extrabold text-white"
                            >
                              <Eye className="w-4 h-4" />
                              {tr("عرض التفاصيل", "View details")}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(p._id);
                                setSelectedPatientLabel(p.user.fullName);
                                setSuspendOpen(true);
                              }}
                              disabled={p.user.accountStatus === "suspended"}
                              className="flex h-[34px] w-[150px] items-center justify-center gap-2 rounded-[10px] border border-[#FB923C] bg-white font-cairo text-[12px] font-extrabold text-[#F97316] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Ban className="w-4 h-4" />
                              {tr("تعليق الحساب", "Suspend account")}
                            </button>

                            {p.user.accountStatus !== "active" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setAccountActionTarget({
                                    id: p._id,
                                    label: p.user.fullName,
                                    action: actionKind,
                                  })
                                }
                                className="flex h-[34px] w-[150px] items-center justify-center gap-2 rounded-[10px] border border-[#BBF7D0] bg-[#ECFDF3] font-cairo text-[12px] font-extrabold text-[#15803D]"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                {actionKind === "unsuspend"
                                  ? tr("رفع التعليق", "Unsuspend")
                                  : tr("تفعيل الحساب", "Activate account")}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">
            {tr("الصفحة", "Page")} {filters.page} {tr("من", "of")} {totalPages}
          </div>

          <div className="flex gap-3 items-center">
            <div className="w-[118px] shrink-0">
              <StyledSelect
                size="xs"
                tone="emphasis"
                value={String(filters.limit)}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number(v),
                    page: 1,
                  }))
                }
                options={[20, 50, 100].map((v) => ({
                  value: String(v),
                  label: String(v),
                }))}
                listboxAriaLabel={tr(
                  "عدد العناصر في الصفحة",
                  "Items per page",
                )}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tr("السابق", "Previous")}
            </button>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tr("التالي", "Next")}
            </button>
          </div>
        </section>

        <div className="h-8" />
      </div>

      <SuspendAccountDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        kind="patient"
        targetId={selectedPatientId}
        targetLabel={selectedPatientLabel}
        onSuccess={() => {
          setSuspendOpen(false);
          void refetch();
        }}
      />

      <ConfirmActionDialog
        open={accountActionTarget !== null}
        onOpenChange={(open) => {
          if (!open && !accountActionBusy) setAccountActionTarget(null);
        }}
        variant="primary"
        title={
          accountActionTarget?.action === "unsuspend"
            ? tr("تأكيد رفع التعليق", "Confirm unsuspend")
            : tr("تأكيد تفعيل الحساب", "Confirm activate account")
        }
        description={
          accountActionTarget ? (
            <>
              {accountActionTarget.action === "unsuspend"
                ? tr(
                    "سيتم رفع التعليق عن حساب المريض",
                    "Suspension will be lifted for patient",
                  )
                : tr(
                    "سيتم تفعيل حساب المريض",
                    "Patient account will be activated",
                  )}{" "}
              <span className="font-extrabold text-[#344054]">
                {accountActionTarget.label}
              </span>
              .
            </>
          ) : (
            "—"
          )
        }
        confirmLabel={
          accountActionTarget?.action === "unsuspend"
            ? tr("رفع التعليق", "Unsuspend")
            : tr("تفعيل الحساب", "Activate account")
        }
        confirmDisabled={accountActionBusy}
        onConfirm={runAccountAction}
      />
    </>
  );
}
