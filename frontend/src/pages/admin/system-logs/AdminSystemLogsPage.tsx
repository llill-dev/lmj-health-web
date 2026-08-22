import { Helmet } from "react-helmet-async";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  AdminAuditLogFilters,
  type AuditAdvancedFilters,
} from "@/components/admin/system-logs/AdminAuditLogFilters";
import { AdminAuditLogPagination } from "@/components/admin/system-logs/AdminAuditLogPagination";
import { AdminAuditLogPrivacyNote } from "@/components/admin/system-logs/AdminAuditLogPrivacyNote";
import { AdminAuditLogTable } from "@/components/admin/system-logs/AdminAuditLogTable";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import {
  Activity,
  AlertCircle,
  FilterX,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { PAGE_SIZE } from "@/components/admin/system-logs/auditLogConstants";
import { useAdminAuditLogs } from "@/hooks/admin/audit/useAdminAuditLogs";
import type { AuditLogCategory, AuditLogOutcome } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

const EMPTY_ADVANCED: AuditAdvancedFilters = {
  actorUserId: "",
  targetUserId: "",
  patientId: "",
  entityType: "",
  entityId: "",
  action: "",
  requestId: "",
  ip: "",
};

export default function AdminSystemLogsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditLogCategory | "">("");
  const [outcome, setOutcome] = useState<AuditLogOutcome | "">("");
  const [actorRole, setActorRole] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [advanced, setAdvanced] =
    useState<AuditAdvancedFilters>(EMPTY_ADVANCED);
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(search, 350);
  const [debouncedAdvanced] = useDebounce(advanced, 350);

  const params = useMemo(() => {
    const advancedParams = Object.fromEntries(
      Object.entries(debouncedAdvanced)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ""),
    );

    return {
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category ? { category } : {}),
      ...(outcome ? { outcome } : {}),
      ...(actorRole ? { actorRole } : {}),
      ...(from ? { from: new Date(from).toISOString() } : {}),
      ...(to ? { to: new Date(to).toISOString() } : {}),
      ...advancedParams,
    };
  }, [
    page,
    debouncedSearch,
    category,
    outcome,
    actorRole,
    from,
    to,
    debouncedAdvanced,
  ]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("");
    setOutcome("");
    setActorRole("");
    setFrom("");
    setTo("");
    setAdvanced(EMPTY_ADVANCED);
    setPage(1);
  }, []);

  const bumpPage = useCallback(() => setPage(1), []);

  const { data, isAwaitingData, isError, error, refetch } =
    useAdminAuditLogs(params);

  const logs = data?.auditLogs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // KPI counts must reflect every matching record for the active filters,
  // not just `logs` (the current page, at most PAGE_SIZE rows). Each count
  // is a separate, cheap `limit=1` request that reuses the same filters and
  // reads the server's `total` for that one outcome/category.
  const { data: failData } = useAdminAuditLogs({
    ...params,
    outcome: "FAIL",
    page: 1,
    limit: 1,
  });
  const { data: denyData } = useAdminAuditLogs({
    ...params,
    outcome: "DENY",
    page: 1,
    limit: 1,
  });
  const { data: phiData } = useAdminAuditLogs({
    ...params,
    category: "PHI",
    page: 1,
    limit: 1,
  });
  const failCount = failData?.total ?? 0;
  const denyCount = denyData?.total ?? 0;
  const phiCount = phiData?.total ?? 0;

  const hasAdvancedFilters = Object.values(advanced).some(
    (v) => v.trim() !== "",
  );
  const hasActiveFilters = !!(
    debouncedSearch ||
    category ||
    outcome ||
    actorRole ||
    from ||
    to ||
    hasAdvancedFilters
  );

  return (
    <>
      <Helmet>
        <title>{tr("سجلات النظام", "System logs")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("سجلات النظام", "System logs")}
          subtitle={tr(
            "مراجعة جميع الأنشطة والحركات في النظام بالوقت الفعلي",
            "Review all system activity and events in near real time",
          )}
          headerIcon={<Activity className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={[
            {
              key: "total",
              icon: <Activity className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : total.toLocaleString(numberLocale),
              label: tr("إجمالي السجلات", "Total records"),
            },
            {
              key: "fail",
              icon: <ShieldAlert className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : failCount,
              label: tr("إجراءات فاشلة", "Failed actions"),
            },
            {
              key: "deny",
              icon: <Shield className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : denyCount,
              label: tr("محاولات مرفوضة", "Denied attempts"),
            },
            {
              key: "phi",
              icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : phiCount,
              label: tr("وصول للبيانات الطبية", "PHI access"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه الصفحة مخصّصة للمراجعة التدقيقية والبحث في السجل فقط. السجلات هنا مرجعية وغير قابلة للتعديل، ويجب استخدام الشاشات الأصلية المرتبطة بكل كيان عند الحاجة إلى تنفيذ إجراء فعلي أو تصحيح البيانات.",
              "This page is for audit review and log search only. The records here are reference-only and cannot be edited, so use the original entity pages whenever a real action or data correction is needed.",
            )}
          </div>
        </div>

        <AdminAuditLogFilters
          search={search}
          category={category}
          outcome={outcome}
          actorRole={actorRole}
          from={from}
          to={to}
          advanced={advanced}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={(v) => {
            setSearch(v);
            bumpPage();
          }}
          onCategoryChange={(v) => {
            setCategory(v);
            bumpPage();
          }}
          onOutcomeChange={(v) => {
            setOutcome(v);
            bumpPage();
          }}
          onActorRoleChange={(v) => {
            setActorRole(v);
            bumpPage();
          }}
          onFromChange={(v) => {
            setFrom(v);
            bumpPage();
          }}
          onToChange={(v) => {
            setTo(v);
            bumpPage();
          }}
          onAdvancedChange={(key, value) => {
            setAdvanced((prev) => ({ ...prev, [key]: value }));
            bumpPage();
          }}
          onReset={resetFilters}
        />

        {!isAwaitingData && !isError ? (
          <section className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-cairo text-[12px] font-bold text-[#475467]">
                {hasActiveFilters
                  ? tr(
                      `تم تطبيق الفلاتر الحالية ويجري عرض ${total.toLocaleString(numberLocale)} سجل مطابق.`,
                      `Current filters are applied and ${total.toLocaleString(numberLocale)} matching records are shown.`,
                    )
                  : tr(
                      `يتم عرض جميع السجلات المطابقة ضمن الصفحة الحالية وعددها ${total.toLocaleString(numberLocale)}.`,
                      `All matching records for the current page scope are shown: ${total.toLocaleString(numberLocale)}.`,
                    )}
              </div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-2 self-start rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054] md:self-auto"
                >
                  <FilterX className="h-4 w-4" />
                  {tr("مسح كل الفلاتر", "Clear all filters")}
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <AdminAuditLogTable
          isAwaitingData={isAwaitingData}
          isError={isError}
          error={error}
          logs={logs}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          onRetry={() => {
            void refetch();
          }}
        />

        {!isAwaitingData && !isError && (
          <AdminAuditLogPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}

        <AdminAuditLogPrivacyNote />
      </div>
    </>
  );
}
