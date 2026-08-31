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
  const { t, locale, dir } = useI18n();
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
  const periodRange = useMemo(
    () => resolveClientDateRangeForPeriod(period),
    [period],
  );
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
      (overdueQuery.isError ||
        outstandingQuery.isError ||
        partialQuery.isError));
  const pageError =
    dashboardQuery.error ??
    overdueQuery.error ??
    outstandingQuery.error ??
    partialQuery.error;

  return (
    <>
      <Helmet>
        <title>{t("doctor.clinicAccounts.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ClinicAccountsBanner
          title={t("doctor.clinicAccounts.title")}
          subtitle={t("doctor.clinicAccounts.subtitle")}
          icon={<Wallet className="w-7 h-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder={t("doctor.clinicAccounts.search.placeholder")}
          trailing={
            <ClinicAccountsSearchCount
              count={overdueQuery.total}
              label={t("doctor.clinicAccounts.search.overdueInvoices")}
            />
          }
        />

        <div className="mb-4">
          <ClinicAccountsPeriodFilter value={period} onChange={setPeriod} />
        </div>

        {isError ? (
          <DoctorListErrorState
            title={t("doctor.clinicAccounts.error.loadFailed")}
            brief={getUserFacingRequestErrorMessage(pageError)}
            retrying={retryingDashboard}
            onRetry={() => void retryDashboard()}
          />
        ) : isAwaitingData || !summary ? (
          <DoctorStatCardsSkeleton count={6} />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.income")}
              value={formatMoney(summary.income)}
              icon={TrendingUp}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.expenses")}
              value={formatMoney(summary.expenses)}
              icon={TrendingDown}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.netProfit")}
              value={formatMoney(summary.netProfit)}
              icon={Wallet}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.unpaid")}
              value={formatMoney(summary.unpaid)}
              icon={FileText}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.pending")}
              value={formatMoney(summary.pending)}
              icon={Clock}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.stat.payments")}
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
              {t("doctor.clinicAccounts.overview")}
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
              {t("doctor.clinicAccounts.quickActions")}
            </h2>
            <div className="space-y-3">
              {canManagePayments ? (
                <>
                  <Link
                    to={`${basePath}/invoices`}
                    className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)]"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                    {t("doctor.clinicAccounts.quickActions.addPayment")}
                  </Link>
                  {!canLoadInvoiceLists ? (
                    <p className="font-cairo text-[12px] font-semibold text-[#B54708]">
                      {t(
                        "doctor.clinicAccounts.quickActions.viewInvoicesRequired",
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
                    {t("doctor.clinicAccounts.quickActions.addExpense")}
                  </Link>
                  {isSecretary && !canViewExpenses ? (
                    <p className="font-cairo text-[12px] font-semibold text-[#B54708]">
                      {t(
                        "doctor.clinicAccounts.quickActions.viewExpensesRequired",
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
                  {t("doctor.clinicAccounts.quickActions.createInvoice")}
                </Link>
              ) : null}
            </div>
            {!canManagePayments && !canManageExpenses && !canManageInvoices ? (
              <p className="mt-4 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {t("doctor.clinicAccounts.quickActions.viewOnly")}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ClinicAccountsSearchCount
                count={overdueQuery.total}
                label={t("doctor.clinicAccounts.search.invoice")}
              />
              <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
                {t("doctor.clinicAccounts.overdueInvoices")}
              </h2>
            </div>
            {!canLoadInvoiceLists ? (
              <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {t("doctor.clinicAccounts.overdueInvoices.permissionRequired")}
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {overdueInvoices.length === 0 ? (
                    <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                      {t("doctor.clinicAccounts.overdueInvoices.none")}
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
                  {t("doctor.clinicAccounts.overdueInvoices.viewAll")}
                </Link>
              </>
            )}
          </div>

          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ClinicAccountsSearchCount
                count={outstandingTotal}
                label={t("doctor.clinicAccounts.search.invoice")}
              />
              <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
                {t("doctor.clinicAccounts.outstandingInvoices")}
              </h2>
            </div>
            {!canLoadInvoiceLists ? (
              <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {t(
                  "doctor.clinicAccounts.outstandingInvoices.permissionRequired",
                )}
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {outstandingInvoices.length === 0 ? (
                    <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                      {t("doctor.clinicAccounts.outstandingInvoices.none")}
                    </p>
                  ) : (
                    outstandingInvoices
                      .slice(0, PREVIEW_LIMIT)
                      .map((invoice) => (
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
                  {t("doctor.clinicAccounts.outstandingInvoices.viewAll")}
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {t("doctor.clinicAccounts.recentActivity")}
            </h2>
            <Link
              to={`${basePath}/invoices`}
              className="inline-flex shrink-0 items-center gap-2 font-cairo text-[12px] font-extrabold text-primary"
            >
              <Receipt className="w-4 h-4" aria-hidden />
              {t("doctor.clinicAccounts.recentActivity.viewAll")}
            </Link>
          </div>
          {canViewReports ? (
            <RecentActivityList activities={reportsQuery.recentActivities} />
          ) : (
            <p className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {t("doctor.clinicAccounts.recentActivity.permissionRequired")}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
