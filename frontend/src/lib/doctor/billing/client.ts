import { get, post, put } from '@/lib/api';
import { billingEndpoints } from '@/lib/doctor/billing/endpoints';
import {
  buildBillingQueryString,
  type BillingQueryParams,
} from '@/lib/doctor/billing/periodParams';
import type {
  ApiBillingDashboard,
  ApiBillingExpense,
  ApiBillingInvoice,
  ApiBillingPayment,
  ApiBillingRefund,
  ApiBillingReport,
  ApiBillingSettings,
  ApiSupportedCurrency,
  CreateBillingExpenseBody,
  CreateBillingInvoiceBody,
  CreateBillingPaymentBody,
  CreateBillingRefundBody,
  UpdateBillingInvoiceBody,
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

function withQuery(path: string, params: BillingQueryParams): string {
  return `${path}${buildBillingQueryString(params)}`;
}

export const billingApi = {
  dashboard: (params: BillingQueryParams = {}) =>
    get<{ dashboard?: ApiBillingDashboard }>(
      withQuery(billingEndpoints.dashboard, params),
    ).then((res) => res.dashboard ?? null),

  invoices: {
    list: (params: BillingInvoicesListParams = {}) =>
      get<{
        invoices?: ApiBillingInvoice[];
        total?: number;
        page?: number;
        limit?: number;
      }>(withQuery(billingEndpoints.invoices, params)),

    get: (invoiceId: string) =>
      get<{ invoice?: ApiBillingInvoice }>(
        billingEndpoints.invoiceById(invoiceId),
      ).then((res) => res.invoice ?? null),

    create: (body: CreateBillingInvoiceBody) =>
      post<{ invoice?: ApiBillingInvoice; message?: string }>(
        billingEndpoints.invoices,
        body,
      ),

    issue: (invoiceId: string, body?: { dueAt?: string }) =>
      post<{ invoice?: ApiBillingInvoice; message?: string }>(
        billingEndpoints.invoiceIssue(invoiceId),
        body ?? {},
      ),

    update: (invoiceId: string, body: UpdateBillingInvoiceBody) =>
      put<{ invoice?: ApiBillingInvoice; message?: string }>(
        billingEndpoints.invoiceById(invoiceId),
        body,
      ),
  },

  refunds: {
    create: (body: CreateBillingRefundBody) =>
      post<{
        refund?: ApiBillingRefund;
        payment?: ApiBillingPayment;
        invoice?: ApiBillingInvoice;
        message?: string;
      }>(billingEndpoints.refunds, body),
  },

  payments: {
    list: (params: BillingPaymentsListParams = {}) =>
      get<{
        payments?: ApiBillingPayment[];
        total?: number;
        page?: number;
        limit?: number;
      }>(withQuery(billingEndpoints.payments, params)),

    create: (body: CreateBillingPaymentBody) =>
      post<{ payment?: ApiBillingPayment; invoice?: ApiBillingInvoice; message?: string }>(
        billingEndpoints.payments,
        body,
      ),
  },

  expenses: {
    list: (params: BillingExpensesListParams = {}) =>
      get<{
        expenses?: ApiBillingExpense[];
        total?: number;
        page?: number;
        limit?: number;
      }>(withQuery(billingEndpoints.expenses, params)),

    create: (body: CreateBillingExpenseBody) =>
      post<{ expense?: ApiBillingExpense; message?: string }>(
        billingEndpoints.expenses,
        body,
      ),
  },

  reports: {
    get: (params: BillingQueryParams = {}) =>
      get<{ report?: ApiBillingReport }>(
        withQuery(billingEndpoints.reports, params),
      ).then((res) => res.report ?? null),

    exportPdf: (params: BillingQueryParams = {}) =>
      get<{
        downloadUrl?: string;
        url?: string;
        fileName?: string;
        expiresIn?: number;
      }>(withQuery(billingEndpoints.reportsExportPdf, params)),
  },

  settings: {
    get: () =>
      get<{
        settings?: ApiBillingSettings;
        supportedCurrencies?: ApiSupportedCurrency[];
        defaultCurrency?: string;
      }>(billingEndpoints.settings),

    update: (body: Partial<ApiBillingSettings>) =>
      put<{ settings?: ApiBillingSettings; message?: string }>(
        billingEndpoints.settings,
        body,
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
  payments: (params: BillingPaymentsListParams) =>
    [...billingQueryKeys.all, 'payments', params] as const,
  expenses: (params: BillingExpensesListParams) =>
    [...billingQueryKeys.all, 'expenses', params] as const,
  reports: (params: BillingQueryParams) =>
    [...billingQueryKeys.all, 'reports', params] as const,
  settings: () => [...billingQueryKeys.all, 'settings'] as const,
};
