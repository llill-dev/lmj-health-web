'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  billingApi,
  billingQueryKeys,
  type BillingExpensesListParams,
  type BillingInvoicesListParams,
  type BillingPaymentsListParams,
} from '@/lib/doctor/billing/client';
import {
  mapApiExpenseToClinicExpense,
  mapApiInvoiceToClinicInvoice,
  mapDashboardToAccountsSummary,
  mapDashboardTrendsToWeeklyOverview,
  mapExpensesByCategory,
  mapRecentActivitiesFromReport,
  mapReportTrendsToMonthlyFinance,
  mapUiInvoiceStatusToApi,
} from '@/lib/doctor/billing/mappers';
import {
  resolveBillingDashboardPeriodParams,
  resolveBillingReportPeriodParams,
  type BillingQueryParams,
} from '@/lib/doctor/billing/periodParams';
import type { AccountsPeriod } from '@/lib/doctor/clinicAccounts/types';
import type {
  CreateBillingExpenseBody,
  CreateBillingInvoiceBody,
  CreateBillingPaymentBody,
} from '@/lib/doctor/billing/apiTypes';
import type { InvoiceStatus } from '@/lib/doctor/clinicAccounts/types';

const STALE_MS = 1000 * 30;

export function useBillingSettings() {
  const query = useQuery({
    queryKey: billingQueryKeys.settings(),
    queryFn: () => billingApi.settings.get(),
    staleTime: STALE_MS * 4,
  });

  return {
    ...query,
    settings: query.data?.settings ?? null,
    supportedCurrencies: query.data?.supportedCurrencies ?? [],
    currency: query.data?.settings?.currency ?? query.data?.defaultCurrency ?? 'USD',
  };
}

export function useBillingDashboard(
  period: AccountsPeriod,
  currency?: string,
) {
  const params = {
    ...resolveBillingDashboardPeriodParams(period),
    ...(currency ? { currency } : {}),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.dashboard(params),
    queryFn: () => billingApi.dashboard(params),
    staleTime: STALE_MS,
  });

  const dashboard = query.data;

  return {
    ...query,
    params,
    dashboard,
    currency: dashboard?.currency ?? currency ?? null,
    mixedCurrencies: dashboard?.mixedCurrencies ?? false,
    summary: dashboard ? mapDashboardToAccountsSummary(dashboard) : null,
    weeklyOverview: dashboard
      ? mapDashboardTrendsToWeeklyOverview(dashboard)
      : [],
    overdueCount: dashboard?.overdueSummary?.count ?? 0,
    outstandingCount: dashboard?.outstandingSummary?.count ?? 0,
  };
}

export function useBillingInvoices(
  params: BillingInvoicesListParams & {
    uiStatus?: InvoiceStatus | 'all';
  } = {},
) {
  const apiParams: BillingInvoicesListParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 50,
    search: params.search?.trim() || undefined,
    patientId: params.patientId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    status:
      params.status ??
      (params.uiStatus && params.uiStatus !== 'all'
        ? mapUiInvoiceStatusToApi(params.uiStatus)
        : undefined),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.invoices(apiParams),
    queryFn: () => billingApi.invoices.list(apiParams),
    staleTime: STALE_MS,
  });

  const invoices = (query.data?.invoices ?? []).map(mapApiInvoiceToClinicInvoice);

  return {
    ...query,
    invoices,
    total: query.data?.total ?? invoices.length,
    page: query.data?.page ?? apiParams.page ?? 1,
    limit: query.data?.limit ?? apiParams.limit ?? 50,
  };
}

export function useBillingInvoice(invoiceId: string, enabled = true) {
  const query = useQuery({
    queryKey: billingQueryKeys.invoice(invoiceId),
    queryFn: () => billingApi.invoices.get(invoiceId),
    enabled: enabled && Boolean(invoiceId),
    staleTime: STALE_MS,
  });

  const invoice = query.data ? mapApiInvoiceToClinicInvoice(query.data) : null;

  return {
    ...query,
    invoice,
    rawInvoice: query.data,
  };
}

export function useBillingExpenses(params: BillingExpensesListParams = {}) {
  const apiParams: BillingExpensesListParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 50,
    search: params.search?.trim() || undefined,
    category: params.category,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const query = useQuery({
    queryKey: billingQueryKeys.expenses(apiParams),
    queryFn: () => billingApi.expenses.list(apiParams),
    staleTime: STALE_MS,
  });

  const expenses = (query.data?.expenses ?? []).map(mapApiExpenseToClinicExpense);

  return {
    ...query,
    expenses,
    total: query.data?.total ?? expenses.length,
  };
}

export function useBillingPayments(params: BillingPaymentsListParams = {}) {
  const query = useQuery({
    queryKey: billingQueryKeys.payments(params),
    queryFn: () => billingApi.payments.list(params),
    staleTime: STALE_MS,
  });

  return {
    ...query,
    payments: query.data?.payments ?? [],
    total: query.data?.total ?? 0,
  };
}

export function useBillingReports(input: {
  year: number;
  month?: number | 'all';
  currency?: string;
}) {
  const params: BillingQueryParams = {
    ...resolveBillingReportPeriodParams(input),
    ...(input.currency ? { currency: input.currency } : {}),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.reports(params),
    queryFn: () => billingApi.reports.get(params),
    staleTime: STALE_MS,
  });

  const report = query.data;

  return {
    ...query,
    report,
    params,
    currency: report?.currency ?? input.currency ?? null,
    monthlyFinance: report ? mapReportTrendsToMonthlyFinance(report) : [],
    expenseBreakdown: report ? mapExpensesByCategory(report) : [],
    recentActivities: report
      ? mapRecentActivitiesFromReport(report, report.currency ?? input.currency ?? 'USD')
      : [],
    summary: report?.summary ?? null,
  };
}

function invalidateBilling(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all });
}

export function useCreateBillingInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBillingInvoiceBody) =>
      billingApi.invoices.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useCreateBillingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBillingPaymentBody) =>
      billingApi.payments.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useCreateBillingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBillingExpenseBody) =>
      billingApi.expenses.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useExportBillingReportPdf() {
  return useMutation({
    mutationFn: (params: BillingQueryParams) =>
      billingApi.reports.exportPdf(params),
  });
}
