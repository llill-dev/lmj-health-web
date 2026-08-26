"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  billingApi,
  billingQueryKeys,
  type BillingExpensesListParams,
  type BillingInvoicesListParams,
  type BillingPaymentsListParams,
} from "@/lib/doctor/billing/client";
import {
  mapApiExpenseToClinicExpense,
  mapApiInvoiceToClinicInvoice,
  mapDashboardToAccountsSummary,
  mapDashboardTrendsToWeeklyOverview,
  mapExpensesByCategory,
  mapRecentActivitiesFromReport,
  mapReportTrendsToMonthlyFinance,
  mapUiInvoiceStatusToApi,
} from "@/lib/doctor/billing/mappers";
import {
  resolveBillingDashboardPeriodParams,
  resolveBillingReportPeriodParams,
  type BillingQueryParams,
} from "@/lib/doctor/billing/periodParams";
import type { AccountsPeriod } from "@/lib/doctor/clinicAccounts/types";
import type {
  CreateBillingExpenseBody,
  CreateBillingInvoiceBody,
  CreateBillingPaymentBody,
  CreateBillingRefundBody,
  UpdateBillingInvoiceBody,
  ApiBillingSettings,
} from "@/lib/doctor/billing/apiTypes";
import type { InvoiceStatus } from "@/lib/doctor/clinicAccounts/types";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";

const STALE_MS = 1000 * 30;

export function useBillingSettings(enabled = true) {
  const query = useQuery({
    queryKey: billingQueryKeys.settings(),
    queryFn: () => billingApi.settings.get(),
    enabled,
    staleTime: STALE_MS * 4,
  });

  return {
    ...query,
    settings: query.data?.settings ?? null,
    supportedCurrencies: query.data?.supportedCurrencies ?? [],
    currency:
      query.data?.settings?.currency ?? query.data?.defaultCurrency ?? "USD",
    isAwaitingData:
      enabled && isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useBillingDashboard(
  period: AccountsPeriod,
  currency?: string,
  enabled = true,
) {
  const params = {
    ...resolveBillingDashboardPeriodParams(period),
    ...(currency ? { currency } : {}),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.dashboard(params),
    queryFn: () => billingApi.dashboard(params),
    enabled,
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
    isAwaitingData:
      enabled && isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useBillingInvoices(
  params: BillingInvoicesListParams & {
    uiStatus?: InvoiceStatus | "all";
  } = {},
  enabled = true,
) {
  const apiParams: BillingInvoicesListParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 50,
    search: params.search?.trim() || undefined,
    patientId: params.patientId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    currency: params.currency,
    status:
      params.status ??
      (params.uiStatus && params.uiStatus !== "all"
        ? mapUiInvoiceStatusToApi(params.uiStatus)
        : undefined),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.invoices(apiParams),
    queryFn: () => billingApi.invoices.list(apiParams),
    enabled,
    staleTime: STALE_MS,
  });

  const invoices = (query.data?.invoices ?? []).map(
    mapApiInvoiceToClinicInvoice,
  );

  return {
    ...query,
    invoices,
    total: query.data?.total ?? invoices.length,
    page: query.data?.page ?? apiParams.page ?? 1,
    limit: query.data?.limit ?? apiParams.limit ?? 50,
    isAwaitingData: enabled && isAwaitingInitialQueryData(query.data, query.isError),
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
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

/** Resolve invoice by Mongo id or display number (INV-…). */
export function useResolvedBillingInvoice(invoiceRef: string) {
  const trimmed = invoiceRef.trim();
  const looksLikeDisplayNumber = /^INV-/i.test(trimmed);

  const byIdQuery = useQuery({
    queryKey: [...billingQueryKeys.invoice(trimmed), "resolve", "id"] as const,
    queryFn: () => billingApi.invoices.get(trimmed),
    enabled: Boolean(trimmed) && !looksLikeDisplayNumber,
    staleTime: STALE_MS,
    retry: false,
  });

  const shouldSearch =
    Boolean(trimmed) &&
    (looksLikeDisplayNumber ||
      (byIdQuery.isError &&
        !isAwaitingInitialQueryData(byIdQuery.data, byIdQuery.isError)));

  const searchParams: BillingInvoicesListParams = {
    search: trimmed,
    limit: 10,
  };

  const bySearchQuery = useQuery({
    queryKey: [
      ...billingQueryKeys.invoices(searchParams),
      "resolve",
      "search",
    ] as const,
    queryFn: () => billingApi.invoices.list(searchParams),
    enabled: shouldSearch,
    staleTime: STALE_MS,
    retry: false,
  });

  const matchedFromSearch =
    bySearchQuery.data?.invoices?.find(
      (item) => item.id === trimmed || item.number === trimmed,
    ) ?? bySearchQuery.data?.invoices?.[0];

  const rawInvoice = byIdQuery.data ?? matchedFromSearch ?? null;
  const invoice = rawInvoice ? mapApiInvoiceToClinicInvoice(rawInvoice) : null;

  const isAwaitingById =
    !looksLikeDisplayNumber &&
    isAwaitingInitialQueryData(byIdQuery.data, byIdQuery.isError);
  const isAwaitingBySearch =
    shouldSearch &&
    isAwaitingInitialQueryData(bySearchQuery.data, bySearchQuery.isError);

  const isAwaitingData =
    Boolean(trimmed) && !rawInvoice && (isAwaitingById || isAwaitingBySearch);

  const isError =
    Boolean(trimmed) &&
    !isAwaitingData &&
    !rawInvoice &&
    ((looksLikeDisplayNumber && bySearchQuery.isError) ||
      (!looksLikeDisplayNumber && byIdQuery.isError && bySearchQuery.isError));

  const error = byIdQuery.error ?? bySearchQuery.error ?? null;

  const refetch = async () => {
    await Promise.all([
      looksLikeDisplayNumber ? Promise.resolve() : byIdQuery.refetch(),
      shouldSearch || looksLikeDisplayNumber
        ? bySearchQuery.refetch()
        : Promise.resolve(),
    ]);
  };

  return {
    invoice,
    rawInvoice,
    isAwaitingData,
    isError,
    error,
    refetch,
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

  const expenses = (query.data?.expenses ?? []).map(
    mapApiExpenseToClinicExpense,
  );

  return {
    ...query,
    expenses,
    total: query.data?.total ?? expenses.length,
    page: query.data?.page ?? apiParams.page ?? 1,
    limit: query.data?.limit ?? apiParams.limit ?? 50,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useBillingPayments(
  params: BillingPaymentsListParams = {},
  enabled = true,
) {
  const query = useQuery({
    queryKey: billingQueryKeys.payments(params),
    queryFn: () => billingApi.payments.list(params),
    enabled,
    staleTime: STALE_MS,
  });

  return {
    ...query,
    payments: query.data?.payments ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 50,
    isAwaitingData: enabled && isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useBillingReports(input: {
  year: number;
  month?: number | "all";
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  method?: string;
  category?: string;
}, enabled = true) {
  const params: BillingQueryParams = {
    ...resolveBillingReportPeriodParams(input),
    ...(input.currency ? { currency: input.currency } : {}),
  };

  const query = useQuery({
    queryKey: billingQueryKeys.reports(params),
    queryFn: () => billingApi.reports.get(params),
    enabled,
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
      ? mapRecentActivitiesFromReport(
          report,
          report.currency ?? input.currency ?? "USD",
        )
      : [],
    summary: report?.summary ?? null,
    mixedCurrencies: Boolean(report?.mixedCurrencies),
    isAwaitingData:
      enabled && isAwaitingInitialQueryData(query.data, query.isError),
  };
}

function invalidateBilling(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all });
}

export function useCreateBillingInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateBillingInvoiceBody) =>
      billingApi.invoices.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useCreateBillingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateBillingPaymentBody) =>
      billingApi.payments.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useUpdateBillingInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (input: {
      invoiceId: string;
      body: UpdateBillingInvoiceBody;
    }) => billingApi.invoices.update(input.invoiceId, input.body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useBillingInvoicePrefill(appointmentId: string | null) {
  const trimmed = appointmentId?.trim() ?? '';
  const query = useQuery({
    queryKey: billingQueryKeys.prefillVisit(trimmed),
    queryFn: () => billingApi.invoices.prefillVisit(trimmed),
    enabled: Boolean(trimmed),
    staleTime: 60_000,
  });

  return {
    prefill: query.data,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCancelBillingInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (input: { invoiceId: string; reason?: string }) =>
      billingApi.invoices.cancel(input.invoiceId, {
        reason: input.reason,
      }),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useIssueBillingInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (input: { invoiceId: string; dueAt?: string }) =>
      billingApi.invoices.issue(input.invoiceId, input.dueAt ? { dueAt: input.dueAt } : undefined),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useCreateBillingRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateBillingRefundBody) =>
      billingApi.refunds.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useCreateBillingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateBillingExpenseBody) =>
      billingApi.expenses.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useExportBillingReportPdf() {
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (params: BillingQueryParams) =>
      billingApi.reports.exportPdf(params),
  });
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: Partial<ApiBillingSettings>) =>
      billingApi.settings.update(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useBillingServices(params: {
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
} = {}) {
  const query = useQuery({
    queryKey: billingQueryKeys.services(params),
    queryFn: () => billingApi.services.list(params),
    staleTime: 30_000,
  });

  const services = query.data?.services ?? [];
  const total = query.data?.total ?? services.length;
  const limit = params.limit ?? 20;

  return {
    services,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateBillingService() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: import('@/lib/doctor/billing/apiTypes').CreateBillingServiceBody) =>
      billingApi.services.create(body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useUpdateBillingService() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (input: {
      serviceId: string;
      body: import('@/lib/doctor/billing/apiTypes').UpdateBillingServiceBody;
    }) => billingApi.services.update(input.serviceId, input.body),
    onSuccess: () => invalidateBilling(queryClient),
  });
}

export function useDeleteBillingService() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (serviceId: string) => billingApi.services.delete(serviceId),
    onSuccess: () => invalidateBilling(queryClient),
  });
}
