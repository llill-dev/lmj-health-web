import { del, get, post, put } from '@/lib/api';
import { billingEndpoints } from '@/lib/doctor/billing/endpoints';
import {
  buildBillingQueryString,
  type BillingQueryParams,
} from '@/lib/doctor/billing/periodParams';
import type {
  ApiBillingSettings,
  BillingDashboardResponse,
  BillingExpenseResponse,
  BillingExpensesListResponse,
  BillingInvoicePrefillResponse,
  BillingInvoiceResponse,
  BillingInvoicesListResponse,
  BillingPaymentResponse,
  BillingPaymentsListResponse,
  BillingRefundResponse,
  BillingReportExportResponse,
  BillingReportResponse,
  BillingServiceResponse,
  BillingServicesListResponse,
  BillingSettingsResponse,
  CreateBillingExpenseBody,
  CreateBillingInvoiceBody,
  CreateBillingPaymentBody,
  CreateBillingRefundBody,
  CreateBillingServiceBody,
  UpdateBillingInvoiceBody,
  UpdateBillingServiceBody,
} from '@/lib/doctor/billing/apiTypes';

export type BillingInvoicesListParams = {
  status?: string;
  sourceType?: string;
  patientId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type BillingPaymentsListParams = {
  invoiceId?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type BillingExpensesListParams = {
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type BillingServicesListParams = {
  includeInactive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

function withQuery(path: string, params: BillingQueryParams): string {
  return `${path}${buildBillingQueryString(params)}`;
}

export const billingApi = {
  dashboard: (params: BillingQueryParams = {}) =>
    get<BillingDashboardResponse>(
      withQuery(billingEndpoints.dashboard, params),
    ).then((res) => res.dashboard ?? null),

  invoices: {
    list: (params: BillingInvoicesListParams = {}) =>
      get<BillingInvoicesListResponse>(withQuery(billingEndpoints.invoices, params)),

    get: (invoiceId: string) =>
      get<BillingInvoiceResponse>(
        billingEndpoints.invoiceById(invoiceId),
      ).then((res) => res.invoice ?? null),

    create: (body: CreateBillingInvoiceBody) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoices,
        body,
      ),

    issue: (invoiceId: string, body?: { dueAt?: string }) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoiceIssue(invoiceId),
        body ?? {},
      ),

    update: (invoiceId: string, body: UpdateBillingInvoiceBody) =>
      put<BillingInvoiceResponse>(
        billingEndpoints.invoiceById(invoiceId),
        body,
      ),

    prefillVisit: (appointmentId: string) =>
      get<BillingInvoicePrefillResponse>(
        billingEndpoints.invoicePrefillVisit(appointmentId),
      ).then((res) => res.prefill ?? null),

    cancel: (invoiceId: string, body?: { reason?: string }) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoiceCancel(invoiceId),
        body ?? {},
      ),
  },

  refunds: {
    create: (body: CreateBillingRefundBody) =>
      post<BillingRefundResponse>(billingEndpoints.refunds, body),
  },

  payments: {
    list: (params: BillingPaymentsListParams = {}) =>
      get<BillingPaymentsListResponse>(withQuery(billingEndpoints.payments, params)),

    create: (body: CreateBillingPaymentBody) =>
      post<BillingPaymentResponse>(
        billingEndpoints.payments,
        body,
      ),
  },

  expenses: {
    list: (params: BillingExpensesListParams = {}) =>
      get<BillingExpensesListResponse>(withQuery(billingEndpoints.expenses, params)),

    create: (body: CreateBillingExpenseBody) =>
      post<BillingExpenseResponse>(
        billingEndpoints.expenses,
        body,
      ),
  },

  reports: {
    get: (params: BillingQueryParams = {}) =>
      get<BillingReportResponse>(
        withQuery(billingEndpoints.reports, params),
      ).then((res) => res.report ?? null),

    exportPdf: (params: BillingQueryParams = {}) =>
      get<BillingReportExportResponse>(
        withQuery(billingEndpoints.reportsExportPdf, params),
      ),
  },

  settings: {
    get: () =>
      get<BillingSettingsResponse>(billingEndpoints.settings),

    update: (body: Partial<ApiBillingSettings>) =>
      put<BillingSettingsResponse>(
        billingEndpoints.settings,
        body,
      ),
  },

  services: {
    list: (params: BillingServicesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.includeInactive) qs.set('includeInactive', 'true');
      if (params.search?.trim()) qs.set('search', params.search.trim());
      if (params.page != null) qs.set('page', String(params.page));
      if (params.limit != null) qs.set('limit', String(params.limit));
      const query = qs.toString();
      const path = query
        ? `${billingEndpoints.services}?${query}`
        : billingEndpoints.services;
      return get<BillingServicesListResponse>(path);
    },

    get: (serviceId: string) =>
      get<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
      ).then((res) => res.service ?? null),

    create: (body: CreateBillingServiceBody) =>
      post<BillingServiceResponse>(
        billingEndpoints.services,
        body,
      ),

    update: (serviceId: string, body: UpdateBillingServiceBody) =>
      put<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
        body,
      ),

    delete: (serviceId: string) =>
      del<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
      ),
  },
} as const;

export const billingQueryKeys = {
  all: ['doctor', 'billing'] as const,
  dashboard: (params: BillingQueryParams) =>
    [...billingQueryKeys.all, 'dashboard', params] as const,
  invoices: (params: BillingInvoicesListParams) =>
    [...billingQueryKeys.all, 'invoices', params] as const,
  invoice: (invoiceId: string) =>
    [...billingQueryKeys.all, 'invoice', invoiceId] as const,
  prefillVisit: (appointmentId: string) =>
    [...billingQueryKeys.all, 'prefill', appointmentId] as const,
  payments: (params: BillingPaymentsListParams) =>
    [...billingQueryKeys.all, 'payments', params] as const,
  expenses: (params: BillingExpensesListParams) =>
    [...billingQueryKeys.all, 'expenses', params] as const,
  reports: (params: BillingQueryParams) =>
    [...billingQueryKeys.all, 'reports', params] as const,
  settings: () => [...billingQueryKeys.all, 'settings'] as const,
  services: (params: BillingServicesListParams) =>
    [...billingQueryKeys.all, 'services', params] as const,
};
