"use client";

import {
  Clock,
  CreditCard,
  FileText,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AccountsOverviewChart,
  ClinicAccountsBanner,
  ClinicAccountsPeriodFilter,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsStatCard,
  ClinicAccountsSubNav,
  RecentActivityList,
} from "@/components/doctor/clinic-accounts";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorStatCardsSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useBillingDashboard,
  useBillingInvoices,
  useBillingReports,
  useBillingSettings,
} from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { isAwaitingAnyInitialQueryData } from "@/lib/query/queryUi";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useI18n } from "@/i18n/provider";
import {
  formatBillingAmount,
  formatBillingNumber,
} from "@/lib/doctor/billing/format";
import type { AccountsPeriod } from "@/lib/doctor/clinicAccounts/types";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";
import { resolveClientDateRangeForPeriod } from "@/lib/doctor/billing/periodParams";

export default function DoctorClinicAccountsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const {
    basePath,
    canViewReports,
    canViewInvoices,
    canViewExpenses,
    canManagePayments,
    canManageExpenses,
    canManageInvoices,
    canViewSettings,
    isSecretary,
  } = useBillingAccess();
  const [period, setPeriod] = useState<AccountsPeriod>("month");
  const [search, setSearch] = useState("");
  // Latest-few preview only — full pagination/filtering lives on the
  // dedicated Invoices page (linked below) to avoid duplicating it here.
  const PREVIEW_LIMIT = 5;

  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const currency = settingsQuery.currency;

  const dashboardQuery = useBillingDashboard(period, currency);
  // Every other billing query on this page derives its date range from the
  // same `period` selector as the dashboard KPIs, so invoice previews and the
  // recent-activity feed never silently show "all time" while the KPIs above
  // them reflect a narrower period.
  const periodRange = useMemo(() => resolveClientDateRangeForPeriod(period), [period]);
  const canLoadInvoiceLists = !isSecretary || canViewInvoices;
  const overdueQuery = useBillingInvoices(
    {
      status: "overdue",
      search,
      currency,
      dateFrom: periodRange.dateFrom,
      dateTo: periodRange.dateTo,
      page: 1,
      limit: PREVIEW_LIMIT,
    },
    canLoadInvoiceLists,
  );
  const outstandingQuery = useBillingInvoices(
    {
      status: "issued",
      search,
      currency,
      dateFrom: periodRange.dateFrom,
      dateTo: periodRange.dateTo,
      page: 1,
      limit: PREVIEW_LIMIT,
    },
    canLoadInvoiceLists,
  );
  const partialQuery = useBillingInvoices(
    {
      status: "partial",
      search,
      currency,
      dateFrom: periodRange.dateFrom,
      dateTo: periodRange.dateTo,
      page: 1,
      limit: PREVIEW_LIMIT,
    },
    canLoadInvoiceLists,
  );
  const reportsQuery = useBillingReports(
    {
      year: new Date().getFullYear(),
      month: "all",
      currency,
      dateFrom: periodRange.dateFrom,
      dateTo: periodRange.dateTo,
    },
    !isSecretary || canViewReports,
  );
  const { retry: retryDashboard, retrying: retryingDashboard } = useRetryAction(
    () =>
      Promise.all([
        dashboardQuery.refetch(),
        overdueQuery.refetch(),
        outstandingQuery.refetch(),
        partialQuery.refetch(),
      ]),
  );

  const summary = dashboardQuery.summary;
  const formatMoney = (value: number) =>
    formatBillingAmount(value, dashboardQuery.currency ?? currency);

  const overdueInvoices = overdueQuery.invoices;
  const outstandingInvoices = useMemo(() => {
    const merged = [...outstandingQuery.invoices, ...partialQuery.invoices];
    const seen = new Set<string>();
    return merged.filter((invoice) => {
      const key = invoice.rawId ?? invoice.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [outstandingQuery.invoices, partialQuery.invoices]);

  const outstandingTotal = outstandingQuery.total + partialQuery.total;

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: dashboardQuery.data, isError: dashboardQuery.isError },
    ...(canLoadInvoiceLists
      ? [
          { data: overdueQuery.data, isError: overdueQuery.isError },
          { data: outstandingQuery.data, isError: outstandingQuery.isError },
          { data: partialQuery.data, isError: partialQuery.isError },
        ]
      : []),
  ]);
  const isError =
    dashboardQuery.isError ||
    (canLoadInvoiceLists &&
      (overdueQuery.isError || outstandingQuery.isError || partialQuery.isError));
  const pageError =
    dashboardQuery.error ??
    overdueQuery.error ??
    outstandingQuery.error ??
    partialQuery.error;

  return (
    <>
      <Helmet>
        <title>{tr("الحسابات • LMJ Health", "Accounts • LMJ Health")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ClinicAccountsBanner
          title={tr("الحسابات", "Accounts")}
          subtitle={tr("إدارة حسابات العيادة", "Manage clinic accounts")}
          icon={<Wallet className="w-7 h-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder={tr("بحث...", "Search...")}
          trailing={
            <ClinicAccountsSearchCount
              count={overdueQuery.total}
              label={tr("فاتورة متأخرة", "overdue invoices")}
            />
          }
        />

        <div className="mb-4">
          <ClinicAccountsPeriodFilter value={period} onChange={setPeriod} />
        </div>

        {isError ? (
          <DoctorListErrorState
            title={tr("تعذّر تحميل الحسابات", "Failed to load accounts")}
            brief={getUserFacingRequestErrorMessage(pageError)}
            retrying={retryingDashboard}
            onRetry={() => void retryDashboard()}
          />
        ) : isAwaitingData || !summary ? (
          <DoctorStatCardsSkeleton count={6} />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ClinicAccountsStatCard
              label={tr("الدخل", "Income")}
              value={formatMoney(summary.income)}
              icon={TrendingUp}
            />
            <ClinicAccountsStatCard
              label={tr("المصروفات", "Expenses")}
              value={formatMoney(summary.expenses)}
              icon={TrendingDown}
            />
            <ClinicAccountsStatCard
              label={tr("صافي الربح", "Net profit")}
              value={formatMoney(summary.netProfit)}
              icon={Wallet}
            />
            <ClinicAccountsStatCard
              label={tr("غير المدفوع", "Unpaid")}
              value={formatMoney(summary.unpaid)}
              icon={FileText}
            />
            <ClinicAccountsStatCard
              label={tr("المتأخر", "Pending")}
              value={formatMoney(summary.pending)}
              icon={Clock}
            />
            <ClinicAccountsStatCard
              label={tr("عدد الدفعات", "Number of payments")}
              value={formatBillingNumber(summary.payments, {

                maximumFractionDigits: 0,
              })}
              icon={CreditCard}
            />
          </section>
        )}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {tr("نظرة عامة", "Overview")}
            </h2>
            {dashboardQuery.isAwaitingData ? (
              <div className="h-[220px] rounded-[12px] bg-[#F3F4F6]" />
            ) : (
              <AccountsOverviewChart
                data={dashboardQuery.weeklyOverview}
                currency={settingsQuery.currency}
              />
            )}
          </div>

          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {tr("إجراءات سريعة", "Quick actions")}
            </h2>
            <div className="space-y-3">
              {canManagePayments ? (
                <>
                  <Link
                    to={`${basePath}/invoices`}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)]"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                    {tr("إضافة دفعة على فاتورة", "Add a payment to an invoice")}
                  </Link>
                  {!canLoadInvoiceLists ? (
                    <p className="font-cairo text-[12px] font-semibold text-[#B54708]">
                      {tr(
                        "يتطلب فتح الفواتير من هذه الصفحة صلاحية عرض الفواتير أيضاً.",
                        "Opening invoices from this page also requires the view-invoices permission.",
                      )}
                    </p>
                  ) : null}
                </>
              ) : null}
              {canManageExpenses ? (
                <>
                  <Link
                    to={`${basePath}/expenses`}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                    {tr("إضافة مصروف", "Add expense")}
                  </Link>
                  {isSecretary && !canViewExpenses ? (
                    <p className="font-cairo text-[12px] font-semibold text-[#B54708]">
                      {tr(
                        "يتطلب فتح صفحة المصاريف صلاحية عرض المصاريف أيضاً.",
                        "Opening the expenses page also requires the view-expenses permission.",
                      )}
                    </p>
                  ) : null}
                </>
              ) : null}
              {canManageInvoices ? (
                <Link
                  to={`${basePath}/invoices/new`}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                  {tr("إنشاء فاتورة", "Create invoice")}
                </Link>
              ) : null}
            </div>
            {!canManagePayments && !canManageExpenses && !canManageInvoices ? (
              <p className="mt-4 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {tr(
                  "لديك صلاحية عرض البيانات المالية فقط بدون تنفيذ إجراءات إدارة.",
                  "You have permission to view financial data only, without performing management actions.",
                )}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ClinicAccountsSearchCount
                count={overdueQuery.total}
                label={tr("فاتورة", "invoice")}
              />
              <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
                {tr("فواتير متأخرة", "Overdue invoices")}
              </h2>
            </div>
            {!canLoadInvoiceLists ? (
              <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {tr("يتطلب عرض الفواتير المتأخرة صلاحية عرض الفواتير.", "Viewing overdue invoices requires the view-invoices permission.")}
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {overdueInvoices.length === 0 ? (
                    <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                      {tr("لا توجد فواتير متأخرة في الفترة الحالية.", "No overdue invoices for the current period.")}
                    </p>
                  ) : (
                    overdueInvoices.map((invoice) => (
                      <div
                        key={invoice.rawId ?? invoice.id}
                        className="flex flex-col gap-2 rounded-[12px] bg-[#F0FDFA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-cairo text-[16px] font-black text-primary">
                          {formatBillingAmount(
                            invoice.total,
                            invoice.currency ?? currency,
                          )}
                        </span>
                        <div className="text-start">
                          <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                            {invoice.id}
                          </p>
                          <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                            {invoice.patientName} • {invoice.issueDate}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to={`${basePath}/invoices`}
                  className="mt-5 flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] font-cairo text-[13px] font-extrabold text-primary transition-colors hover:bg-[#F8FAFC]"
                >
                  {tr("عرض كل الفواتير المتأخرة", "View all overdue invoices")}
                </Link>
              </>
            )}
          </div>

          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ClinicAccountsSearchCount
                count={outstandingTotal}
                label={tr("فاتورة", "invoice")}
              />
              <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
                {tr("فواتير غير مسددة", "Outstanding invoices")}
              </h2>
            </div>
            {!canLoadInvoiceLists ? (
              <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {tr("يتطلب عرض الفواتير غير المسددة صلاحية عرض الفواتير.", "Viewing outstanding invoices requires the view-invoices permission.")}
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {outstandingInvoices.length === 0 ? (
                    <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                      {tr("لا توجد فواتير معلّقة حاليًا.", "No pending invoices right now.")}
                    </p>
                  ) : (
                    outstandingInvoices.slice(0, PREVIEW_LIMIT).map((invoice) => (
                      <div
                        key={invoice.rawId ?? invoice.id}
                        className="flex flex-col gap-2 rounded-[12px] bg-[#F0FDFA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-cairo text-[16px] font-black text-primary">
                          {formatBillingAmount(
                            invoice.remaining ??
                              Math.max(0, invoice.total - invoice.paid),
                            invoice.currency ?? currency,
                          )}
                        </span>
                        <div className="text-start">
                          <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                            {invoice.id}
                          </p>
                          <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                            {invoice.patientName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to={`${basePath}/invoices`}
                  className="mt-5 flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] font-cairo text-[13px] font-extrabold text-primary transition-colors hover:bg-[#F8FAFC]"
                >
                  {tr("عرض كل الفواتير غير المسددة", "View all outstanding invoices")}
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {tr("النشاطات الأخيرة", "Recent activity")}
            </h2>
            <Link
              to={`${basePath}/invoices`}
              className="inline-flex shrink-0 items-center gap-2 font-cairo text-[12px] font-extrabold text-primary"
            >
              <Receipt className="w-4 h-4" aria-hidden />
              {tr("عرض كل الفواتير", "View all invoices")}
            </Link>
          </div>
          {canViewReports ? (
            <RecentActivityList activities={reportsQuery.recentActivities} />
          ) : (
            <p className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "لا تظهر النشاطات المالية الأخيرة ضمن هذه الصفحة إلا عند منح صلاحية عرض التقارير المالية.",
                "Recent financial activity is only shown on this page once the view-reports permission is granted.",
              )}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
