'use client';

import { BarChart3, FileSpreadsheet, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ClinicAccountsBanner,
  ClinicAccountsStatCard,
  ClinicAccountsSubNav,
  ExpensePieChart,
  ExpensePieLegend,
  FinancialBarChart,
  FinancialLineChart,
} from '@/components/doctor/clinic-accounts';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorStatCardsSkeleton } from '@/components/doctor/shared/skeletons';
import {
  useBillingReports,
  useBillingSettings,
  useExportBillingReportPdf,
} from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import { useToast } from '@/components/ui/ToastProvider';

const MONTHS = [
  { value: 'all', label: 'السنة كاملة' },
  { value: '1', label: 'يناير' },
  { value: '2', label: 'فبراير' },
  { value: '3', label: 'مارس' },
  { value: '4', label: 'أبريل' },
  { value: '5', label: 'مايو' },
  { value: '6', label: 'يونيو' },
  { value: '7', label: 'يوليو' },
  { value: '8', label: 'أغسطس' },
  { value: '9', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

export default function DoctorClinicFinancialReportsPage() {
  const { toast } = useToast();
  const settingsQuery = useBillingSettings();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<string>('all');

  const reportMonth = month === 'all' ? 'all' : Number(month);
  const reportsQuery = useBillingReports({
    year,
    month: reportMonth,
    currency: settingsQuery.currency,
  });
  const exportPdf = useExportBillingReportPdf();

  const currency = reportsQuery.currency ?? settingsQuery.currency;
  const formatMoney = (value: number) => formatBillingAmount(value, currency);

  const totals = useMemo(() => {
    const summary = reportsQuery.summary;
    if (summary) {
      return {
        income: summary.income ?? 0,
        expenses: summary.expenses ?? 0,
        profit: summary.profit ?? 0,
      };
    }
    const data = reportsQuery.monthlyFinance;
    return {
      income: data.reduce((sum, item) => sum + item.income, 0),
      expenses: data.reduce((sum, item) => sum + item.expenses, 0),
      profit: data.reduce((sum, item) => sum + item.profit, 0),
    };
  }, [reportsQuery.monthlyFinance, reportsQuery.summary]);

  const handleExportPdf = async () => {
    try {
      const result = await exportPdf.mutateAsync(reportsQuery.params);
      const url = result.downloadUrl ?? result.url;
      if (!url) {
        throw new Error('missing_download_url');
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      toast('تم تجهيز ملف PDF للتقرير.', {
        title: 'تصدير PDF',
        variant: 'success',
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر التصدير',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>التقارير المالية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="التقارير المالية"
          subtitle="التقارير الشاملة للدخل والمصاريف والربح"
          icon={<BarChart3 className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <div className="mb-6 flex flex-wrap justify-start gap-3">
          <select
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-[44px] rounded-[10px] border border-[#EEF2F6] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-[44px] rounded-[10px] border border-[#EEF2F6] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          >
            {MONTHS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {reportsQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل التقرير المالي"
            brief={getUserFacingRequestErrorMessage(reportsQuery.error)}
            retrying={reportsQuery.isFetching}
            onRetry={() => void reportsQuery.refetch()}
          />
        ) : reportsQuery.isLoading ? (
          <DoctorStatCardsSkeleton count={3} columns={3} />
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ClinicAccountsStatCard label="الدخل" value={formatMoney(totals.income)} icon={TrendingUp} />
            <ClinicAccountsStatCard
              label="المصاريف"
              value={formatMoney(totals.expenses)}
              icon={TrendingDown}
              className="bg-[#EF4444]"
            />
            <ClinicAccountsStatCard label="الربح" value={formatMoney(totals.profit)} icon={BarChart3} />
          </section>
        )}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              الدخل والمصاريف
            </h2>
            <FinancialBarChart data={reportsQuery.monthlyFinance} />
          </div>
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              اتجاه الربح
            </h2>
            <FinancialLineChart data={reportsQuery.monthlyFinance} />
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
            المصاريف حسب الفئة
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ExpensePieChart data={reportsQuery.expenseBreakdown} />
            <ExpensePieLegend data={reportsQuery.expenseBreakdown} />
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
            تصدير التقرير
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={exportPdf.isPending}
              onClick={() => void handleExportPdf()}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
            >
              <FileText className="h-4 w-4" aria-hidden />
              {exportPdf.isPending ? 'جاري التصدير...' : 'PDF'}
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#E5E7EB] font-cairo text-[14px] font-extrabold text-[#98A2B3]"
              title="Excel غير مدعوم في API-3 حالياً"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              Excel (قريباً)
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
