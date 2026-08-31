"use client";

import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ClinicAccountsBanner,
  ClinicAccountsStatCard,
  ClinicAccountsSubNav,
  ExpensePieChart,
  ExpensePieLegend,
  FinancialBarChart,
  FinancialLineChart,
} from "@/components/doctor/clinic-accounts";
import StyledSelect from "@/components/ui/styled-select";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorStatCardsSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useBillingReports,
  useBillingSettings,
  useExportBillingReportPdf,
} from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { formatBillingAmount } from "@/lib/doctor/billing/format";
import { formatBillingCurrencyOptionLabel } from "@/lib/doctor/billing/settingsUi";
import { triggerBrowserFileDownloadAndOpen } from "@/lib/files/triggerBrowserFileDownload";
import { useToast } from "@/components/ui/ToastProvider";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";
import { useI18n } from "@/i18n/provider";

function buildMonths(t: (key: string) => string) {
  return [
    {
      value: "all",
      label: t("doctor.clinicAccounts.financialReports.month.all"),
    },
    {
      value: "1",
      label: t("doctor.clinicAccounts.financialReports.month.january"),
    },
    {
      value: "2",
      label: t("doctor.clinicAccounts.financialReports.month.february"),
    },
    {
      value: "3",
      label: t("doctor.clinicAccounts.financialReports.month.march"),
    },
    {
      value: "4",
      label: t("doctor.clinicAccounts.financialReports.month.april"),
    },
    {
      value: "5",
      label: t("doctor.clinicAccounts.financialReports.month.may"),
    },
    {
      value: "6",
      label: t("doctor.clinicAccounts.financialReports.month.june"),
    },
    {
      value: "7",
      label: t("doctor.clinicAccounts.financialReports.month.july"),
    },
    {
      value: "8",
      label: t("doctor.clinicAccounts.financialReports.month.august"),
    },
    {
      value: "9",
      label: t("doctor.clinicAccounts.financialReports.month.september"),
    },
    {
      value: "10",
      label: t("doctor.clinicAccounts.financialReports.month.october"),
    },
    {
      value: "11",
      label: t("doctor.clinicAccounts.financialReports.month.november"),
    },
    {
      value: "12",
      label: t("doctor.clinicAccounts.financialReports.month.december"),
    },
  ];
}

export default function DoctorClinicFinancialReportsPage() {
  const { t, locale, dir } = useI18n();
  const months = buildMonths(t);
  const { toast } = useToast();
  const { canExportReports, canViewSettings, isSecretary } = useBillingAccess();
  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currencyOverride, setCurrencyOverride] = useState<string>("");
  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - 2 + index),
    [currentYear],
  );

  const reportMonth = month === "all" ? "all" : Number(month);
  const useCustomRange = Boolean(dateFrom && dateTo);
  const reportsQuery = useBillingReports({
    year,
    month: reportMonth,
    currency: currencyOverride || settingsQuery.currency,
    dateFrom: useCustomRange ? dateFrom : undefined,
    dateTo: useCustomRange ? dateTo : undefined,
  });
  const exportPdf = useExportBillingReportPdf();
  const { retry: retryReports, retrying: retryingReports } = useRetryAction(
    () => reportsQuery.refetch(),
  );

  const currency =
    reportsQuery.currency ?? currencyOverride ?? settingsQuery.currency;
  const formatMoney = (value: number) => formatBillingAmount(value, currency);
  const currencyOptions = useMemo(() => {
    const list = settingsQuery.supportedCurrencies?.length
      ? settingsQuery.supportedCurrencies
      : [];
    return [
      {
        value: "",
        label: t("doctor.clinicAccounts.financialReports.defaultCurrency"),
      },
      ...list.map((item) => ({
        value: item.code,
        label: formatBillingCurrencyOptionLabel(item.code, item.name, t),
      })),
    ];
  }, [settingsQuery.supportedCurrencies, t]);

  const totals = useMemo(() => {
    const summary = reportsQuery.summary;
    if (summary) {
      return {
        income: summary.income ?? 0,
        expenses: summary.expenses ?? 0,
        profit: summary.profit ?? 0,
        refunds: summary.refunds ?? 0,
      };
    }
    const data = reportsQuery.monthlyFinance;
    return {
      income: data.reduce((sum, item) => sum + item.income, 0),
      expenses: data.reduce((sum, item) => sum + item.expenses, 0),
      profit: data.reduce((sum, item) => sum + item.profit, 0),
      refunds: 0,
    };
  }, [reportsQuery.monthlyFinance, reportsQuery.summary]);

  const handleExportPdf = async () => {
    try {
      const result = await exportPdf.mutateAsync(reportsQuery.params);
      const url = result.downloadUrl ?? result.url;
      if (!url) {
        throw new Error("missing_download_url");
      }
      const fileName =
        result.fileName?.trim() ||
        `billing-report-${year}${month === "all" ? "" : `-${month}`}.pdf`;
      await triggerBrowserFileDownloadAndOpen(url, fileName);
      toast(t("doctor.clinicAccounts.financialReports.exportSuccess"), {
        title: t("doctor.clinicAccounts.financialReports.exportTitle"),
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.clinicAccounts.financialReports.exportFailed"),
        variant: "error",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.clinicAccounts.financialReports.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ClinicAccountsBanner
          title={t("doctor.clinicAccounts.financialReports.title")}
          subtitle={t("doctor.clinicAccounts.financialReports.subtitle")}
          icon={<BarChart3 className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <div className="mb-3 flex flex-wrap items-center justify-start gap-3">
          <select
            value={String(year)}
            disabled={useCustomRange}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-[44px] rounded-[10px] border border-[#EEF2F6] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            disabled={useCustomRange}
            onChange={(e) => setMonth(e.target.value)}
            className="h-[44px] rounded-[10px] border border-[#EEF2F6] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {months.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="w-[180px]">
            <StyledSelect
              options={currencyOptions}
              value={currencyOverride}
              onChange={setCurrencyOverride}
              listboxAriaLabel={t(
                "doctor.clinicAccounts.financialReports.currency",
              )}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="font-cairo text-[12px] font-bold text-[#667085]">
            {t("doctor.clinicAccounts.financialReports.customRange")}
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-[40px] rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-[40px] rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          />
          {useCustomRange ? (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="font-cairo text-[12px] font-extrabold text-primary hover:underline"
            >
              {t("doctor.clinicAccounts.financialReports.clearCustomRange")}
            </button>
          ) : null}
        </div>

        {reportsQuery.mixedCurrencies ? (
          <div className="mb-4 rounded-[12px] border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B54708]">
            {t("doctor.clinicAccounts.financialReports.mixedCurrenciesWarning")}
          </div>
        ) : null}

        {reportsQuery.isError ? (
          <DoctorListErrorState
            title={t("doctor.clinicAccounts.financialReports.loadFailed")}
            brief={getUserFacingRequestErrorMessage(reportsQuery.error)}
            retrying={retryingReports}
            onRetry={() => void retryReports()}
          />
        ) : reportsQuery.isAwaitingData ? (
          <DoctorStatCardsSkeleton count={3} columns={3} />
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.financialReports.income")}
              value={formatMoney(totals.income)}
              icon={TrendingUp}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.financialReports.expenses")}
              value={formatMoney(totals.expenses)}
              icon={TrendingDown}
              className="bg-[#EF4444]"
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.financialReports.profit")}
              value={formatMoney(totals.profit)}
              icon={BarChart3}
            />
            <ClinicAccountsStatCard
              label={t("doctor.clinicAccounts.financialReports.refunds")}
              value={formatMoney(totals.refunds)}
              icon={TrendingDown}
              className="bg-[#B54708]"
            />
          </section>
        )}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {t("doctor.clinicAccounts.financialReports.incomeAndExpenses")}
            </h2>
            {reportsQuery.monthlyFinance.length === 0 ? (
              <p className="py-10 text-center font-cairo text-[13px] font-semibold text-[#98A2B3]">
                {t("doctor.clinicAccounts.financialReports.noData")}
              </p>
            ) : (
              <FinancialBarChart
                data={reportsQuery.monthlyFinance}
                currency={currency}
              />
            )}
          </div>
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              {t("doctor.clinicAccounts.financialReports.profitTrend")}
            </h2>
            {reportsQuery.monthlyFinance.length === 0 ? (
              <p className="py-10 text-center font-cairo text-[13px] font-semibold text-[#98A2B3]">
                {t("doctor.clinicAccounts.financialReports.noData")}
              </p>
            ) : (
              <FinancialLineChart
                data={reportsQuery.monthlyFinance}
                currency={currency}
              />
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
            {t("doctor.clinicAccounts.financialReports.expensesByCategory")}
          </h2>
          {reportsQuery.expenseBreakdown.length === 0 ? (
            <p className="py-10 text-center font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {t("doctor.clinicAccounts.financialReports.noExpenses")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
              <ExpensePieChart
                data={reportsQuery.expenseBreakdown}
                currency={currency}
              />
              <ExpensePieLegend
                data={reportsQuery.expenseBreakdown}
                currency={currency}
              />
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-start font-cairo text-[16px] font-extrabold text-[#111827]">
            {t("doctor.clinicAccounts.financialReports.exportReport")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {canExportReports ? (
              <button
                type="button"
                disabled={exportPdf.isPending}
                onClick={() => void handleExportPdf()}
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
              >
                <FileText className="h-4 w-4" aria-hidden />
                {exportPdf.isPending
                  ? t("doctor.clinicAccounts.financialReports.exporting")
                  : "PDF"}
              </button>
            ) : (
              <div className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#F2F4F7] px-4 font-cairo text-[13px] font-bold text-[#667085]">
                {t("doctor.clinicAccounts.financialReports.exportNotAvailable")}
              </div>
            )}
            <button
              type="button"
              disabled
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#E5E7EB] font-cairo text-[14px] font-extrabold text-[#98A2B3]"
              title={t(
                "doctor.clinicAccounts.financialReports.excelNotSupported",
              )}
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              {t("doctor.clinicAccounts.financialReports.excelComingSoon")}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
