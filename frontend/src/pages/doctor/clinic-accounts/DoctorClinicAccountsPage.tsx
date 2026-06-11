'use client';

import {
  Clock,
  CreditCard,
  FileText,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  AccountsOverviewChart,
  ClinicAccountsBanner,
  ClinicAccountsPeriodFilter,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsStatCard,
  ClinicAccountsSubNav,
  RecentActivityList,
} from '@/components/doctor/clinic-accounts';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorStatCardsSkeleton } from '@/components/doctor/shared/skeletons';
import {
  useBillingDashboard,
  useBillingInvoices,
  useBillingReports,
  useBillingSettings,
} from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import type { AccountsPeriod } from '@/lib/doctor/clinicAccounts/types';

export default function DoctorClinicAccountsPage() {
  const [period, setPeriod] = useState<AccountsPeriod>('month');
  const [search, setSearch] = useState('');
  const settingsQuery = useBillingSettings();
  const currency = settingsQuery.currency;

  const dashboardQuery = useBillingDashboard(period, currency);
  const overdueQuery = useBillingInvoices({ status: 'overdue', limit: 20 });
  const outstandingQuery = useBillingInvoices({
    status: 'issued',
    limit: 20,
  });
  const partialQuery = useBillingInvoices({ status: 'partial', limit: 20 });
  const reportsQuery = useBillingReports({
    year: new Date().getFullYear(),
    month: 'all',
    currency,
  });

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

  const filteredOverdue = overdueInvoices.filter((invoice) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      invoice.patientName.includes(search.trim()) ||
      invoice.id.toLowerCase().includes(q)
    );
  });

  const filteredOutstanding = outstandingInvoices.filter((invoice) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      invoice.patientName.includes(search.trim()) ||
      invoice.id.toLowerCase().includes(q)
    );
  });

  const isLoading =
    dashboardQuery.isLoading ||
    overdueQuery.isLoading ||
    outstandingQuery.isLoading;
  const isError = dashboardQuery.isError;

  return (
    <>
      <Helmet>
        <title>الحسابات • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="الحسابات"
          subtitle="إدارة حسابات العيادة"
          icon={<Wallet className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder="بحث..."
          trailing={
            <ClinicAccountsSearchCount
              count={filteredOverdue.length}
              label="فاتورة متأخرة"
            />
          }
        />

        <div className="mb-4">
          <ClinicAccountsPeriodFilter value={period} onChange={setPeriod} />
        </div>

        {isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الحسابات"
            brief={getUserFacingRequestErrorMessage(dashboardQuery.error)}
            retrying={dashboardQuery.isFetching}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : isLoading || !summary ? (
          <DoctorStatCardsSkeleton count={6} />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ClinicAccountsStatCard label="الدخل" value={formatMoney(summary.income)} icon={TrendingUp} />
            <ClinicAccountsStatCard label="المصروفات" value={formatMoney(summary.expenses)} icon={TrendingDown} />
            <ClinicAccountsStatCard label="صافي الربح" value={formatMoney(summary.netProfit)} icon={Wallet} />
            <ClinicAccountsStatCard label="غير المدفوع" value={formatMoney(summary.unpaid)} icon={FileText} />
            <ClinicAccountsStatCard label="المتأخر" value={formatMoney(summary.pending)} icon={Clock} />
            <ClinicAccountsStatCard label="عدد الدفعات" value={String(summary.payments)} icon={CreditCard} />
          </section>
        )}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              نظرة عامة
            </h2>
            {dashboardQuery.isLoading ? (
              <div className="h-[220px] animate-pulse rounded-[12px] bg-[#F3F4F6]" />
            ) : (
              <AccountsOverviewChart data={dashboardQuery.weeklyOverview} />
            )}
          </div>

          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              إجراءات سريعة
            </h2>
            <div className="space-y-3">
              <Link
                to="/doctor/accounts/payments/new"
                className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)]"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة دفعة
              </Link>
              <Link
                to="/doctor/accounts/expenses"
                className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة مصروف
              </Link>
              <Link
                to="/doctor/accounts/invoices/new"
                className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إنشاء فاتورة
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              فواتير متأخرة
            </h2>
            <div className="space-y-3">
              {filteredOverdue.length === 0 ? (
                <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                  لا توجد فواتير متأخرة في الفترة الحالية.
                </p>
              ) : (
                filteredOverdue.slice(0, 3).map((invoice) => (
                  <div
                    key={invoice.rawId ?? invoice.id}
                    className="flex items-center justify-between rounded-[12px] bg-[#F0FDFA] px-4 py-3"
                  >
                    <span className="font-cairo text-[16px] font-black text-primary">
                      {formatBillingAmount(invoice.total, invoice.currency ?? currency)}
                    </span>
                    <div className="text-right">
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
          </div>

          <div className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[16px] font-extrabold text-[#111827]">
              فواتير غير مسددة
            </h2>
            <div className="space-y-3">
              {filteredOutstanding.length === 0 ? (
                <p className="py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                  لا توجد فواتير معلّقة حالياً.
                </p>
              ) : (
                filteredOutstanding.slice(0, 3).map((invoice) => (
                  <div
                    key={invoice.rawId ?? invoice.id}
                    className="flex items-center justify-between rounded-[12px] bg-[#F0FDFA] px-4 py-3"
                  >
                    <span className="font-cairo text-[16px] font-black text-primary">
                      {formatBillingAmount(
                        invoice.remaining ?? Math.max(0, invoice.total - invoice.paid),
                        invoice.currency ?? currency,
                      )}
                    </span>
                    <div className="text-right">
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
          </div>
        </section>

        <section className="mt-6 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
          <div className="mb-4 flex w-full items-center justify-between gap-3">
            <h2 className="text-start font-cairo text-[16px] font-extrabold text-[#111827]">
              النشاطات الأخيرة
            </h2>
            <Link
              to="/doctor/accounts/invoices"
              className="inline-flex shrink-0 items-center gap-2 font-cairo text-[12px] font-extrabold text-primary"
            >
              <Receipt className="h-4 w-4" aria-hidden />
              عرض كل الفواتير
            </Link>
          </div>
          <RecentActivityList activities={reportsQuery.recentActivities} />
        </section>
      </div>
    </>
  );
}
