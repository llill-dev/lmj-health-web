import { del, get, post, put } from '@/lib/api';
import { billingEndpoints } from '@/lib/doctor/billing/endpoints';
import {
  buildBillingQueryString,
  type BillingQueryParams,
} from '@/lib/doctor/billing/periodParams';
import type {
  ApiBillingSettings,
  ApiBillingExpense,
  ApiBillingInvoice,
  ApiBillingPayment,
  ApiBillingService,
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

type BillingEnvelope = {
  invoices?: unknown;
  payments?: unknown;
  expenses?: unknown;
  services?: unknown;
  invoice?: unknown;
  payment?: unknown;
  expense?: unknown;
  service?: unknown;
  settings?: unknown;
  supportedCurrencies?: unknown;
  dashboard?: unknown;
  report?: unknown;
  prefill?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
};

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

function asBillingEnvelope(value: unknown): BillingEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as BillingEnvelope)
    : null;
}

function readBillingNestedEnvelope(value: unknown): BillingEnvelope | null {
  const record = asBillingEnvelope(value);
  return (
    asBillingEnvelope(record?.data) ??
    asBillingEnvelope(record?.item) ??
    asBillingEnvelope(record?.result) ??
    null
  );
}

function isBillingRecordArray<T extends Record<string, unknown>>(
  value: unknown,
): value is T[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  );
}

function isBillingRecord<T extends Record<string, unknown>>(value: unknown): value is T {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readBillingNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readBillingListOrEmpty<T>(value: T[] | null): T[] {
  return value ?? [];
}

function readBillingField(value: unknown, key: keyof BillingEnvelope): unknown {
  return asBillingEnvelope(value)?.[key];
}

function readFirstBillingArray<T extends Record<string, unknown>>(
  sources: unknown[],
): T[] | null {
  for (const source of sources) {
    const items = readBillingArray<T>(source);
    if (items) return items;
  }
  return null;
}

function readBillingDetail<T extends Record<string, unknown>>(
  value: unknown,
  keys: Array<keyof BillingEnvelope>,
): T | null {
  const record = asBillingEnvelope(value);
  if (!record) return null;

  for (const key of keys) {
    const direct = readBillingEntity<T>(record[key]);
    if (direct) return direct;
  }

  return (
    readBillingEntity<T>(record.item) ??
    readBillingEntity<T>(record.data) ??
    readBillingDetail<T>(record.data, keys) ??
    readBillingDetail<T>(record.result, keys)
  );
}

function readBillingArray<T extends Record<string, unknown>>(
  value: unknown,
): T[] | null {
  return isBillingRecordArray<T>(value) ? value : null;
}

function readBillingEntity<T extends Record<string, unknown>>(
  value: unknown,
): T | null {
  return isBillingRecord<T>(value) ? value : null;
}

function readBillingInvoices(value: unknown): ApiBillingInvoice[] | null {
  const record = asBillingEnvelope(value);
  if (!record) return null;
  return readFirstBillingArray<ApiBillingInvoice>([
    record.invoices,
    readBillingField(record.data, 'invoices'),
    readBillingField(record.result, 'invoices'),
  ]) ?? readBillingInvoices(record.data) ?? readBillingInvoices(record.result);
}

function readBillingPayments(value: unknown): ApiBillingPayment[] | null {
  const record = asBillingEnvelope(value);
  if (!record) return null;
  return readFirstBillingArray<ApiBillingPayment>([
    record.payments,
    readBillingField(record.data, 'payments'),
    readBillingField(record.result, 'payments'),
  ]) ?? readBillingPayments(record.data) ?? readBillingPayments(record.result);
}

function readBillingExpenses(value: unknown): ApiBillingExpense[] | null {
  const record = asBillingEnvelope(value);
  if (!record) return null;
  return readFirstBillingArray<ApiBillingExpense>([
    record.expenses,
    readBillingField(record.data, 'expenses'),
    readBillingField(record.result, 'expenses'),
  ]) ?? readBillingExpenses(record.data) ?? readBillingExpenses(record.result);
}

function readBillingServices(value: unknown): ApiBillingService[] | null {
  const record = asBillingEnvelope(value);
  if (!record) return null;
  return readFirstBillingArray<ApiBillingService>([
    record.services,
    readBillingField(record.data, 'services'),
    readBillingField(record.result, 'services'),
  ]) ?? readBillingServices(record.data) ?? readBillingServices(record.result);
}

function readBillingInvoice(value: unknown): ApiBillingInvoice | null {
  return readBillingDetail<ApiBillingInvoice>(value, ['invoice']);
}

function readBillingPayment(value: unknown): ApiBillingPayment | null {
  return readBillingDetail<ApiBillingPayment>(value, ['payment']);
}

function readBillingExpense(value: unknown): ApiBillingExpense | null {
  return readBillingDetail<ApiBillingExpense>(value, ['expense']);
}

function readBillingService(value: unknown): ApiBillingService | null {
  return readBillingDetail<ApiBillingService>(value, ['service']);
}

function readBillingDashboard(value: unknown) {
  return readBillingEntity<NonNullable<BillingDashboardResponse["dashboard"]>>(
    readBillingField(value, "dashboard"),
  );
}

function readBillingReport(value: unknown) {
  return readBillingEntity<NonNullable<BillingReportResponse["report"]>>(
    readBillingField(value, "report"),
  );
}

function readBillingPrefill(value: unknown) {
  return readBillingEntity<NonNullable<BillingInvoicePrefillResponse["prefill"]>>(
    readBillingField(value, "prefill"),
  );
}

function normalizePagedBillingResponse<
  T extends { page?: number; limit?: number; total?: number },
>(response: T) {
  const nested = readBillingNestedEnvelope(response);
  return {
    page:
      readBillingNumber(response.page) ??
      readBillingNumber(nested?.page) ??
      response.page,
    limit:
      readBillingNumber(response.limit) ??
      readBillingNumber(nested?.limit) ??
      response.limit,
    total:
      readBillingNumber(response.total) ??
      readBillingNumber(nested?.total) ??
      response.total,
  };
}

function normalizeInvoicesListResponse(
  response: BillingInvoicesListResponse,
): BillingInvoicesListResponse {
  const invoices = readBillingListOrEmpty(readBillingInvoices(response));
  const paging = normalizePagedBillingResponse(response);
  return {
    ...response,
    invoices,
    ...paging,
  };
}

function normalizePaymentsListResponse(
  response: BillingPaymentsListResponse,
): BillingPaymentsListResponse {
  const payments = readBillingListOrEmpty(readBillingPayments(response));
  const paging = normalizePagedBillingResponse(response);
  return {
    ...response,
    payments,
    ...paging,
  };
}

function normalizeExpensesListResponse(
  response: BillingExpensesListResponse,
): BillingExpensesListResponse {
  const expenses = readBillingListOrEmpty(readBillingExpenses(response));
  const paging = normalizePagedBillingResponse(response);
  return {
    ...response,
    expenses,
    ...paging,
  };
}

function normalizeServicesListResponse(
  response: BillingServicesListResponse,
): BillingServicesListResponse {
  const services = readBillingListOrEmpty(readBillingServices(response));
  const paging = normalizePagedBillingResponse(response);
  return {
    ...response,
    services,
    ...paging,
  };
}

function normalizeInvoiceResponse(
  response: BillingInvoiceResponse,
): BillingInvoiceResponse {
  const invoice = readBillingInvoice(response);
  return invoice ? { ...response, invoice } : response;
}

function normalizePaymentResponse(
  response: BillingPaymentResponse,
): BillingPaymentResponse {
  const payment = readBillingPayment(response);
  return payment ? { ...response, payment } : response;
}

function normalizeExpenseResponse(
  response: BillingExpenseResponse,
): BillingExpenseResponse {
  const expense = readBillingExpense(response);
  return expense ? { ...response, expense } : response;
}

function normalizeServiceResponse(
  response: BillingServiceResponse,
): BillingServiceResponse {
  const service = readBillingService(response);
  return service ? { ...response, service } : response;
}

function normalizeSettingsResponse(
  response: BillingSettingsResponse,
): BillingSettingsResponse {
  const nested = readBillingNestedEnvelope(response);
  return {
    ...response,
    settings:
      readBillingEntity<ApiBillingSettings>(response.settings) ??
      readBillingEntity<ApiBillingSettings>(nested?.settings) ??
      response.settings,
    supportedCurrencies:
      readBillingArray(response.supportedCurrencies) ??
      readBillingArray(nested?.supportedCurrencies) ??
      response.supportedCurrencies,
  };
}

export const billingApi = {
  dashboard: (params: BillingQueryParams = {}) =>
    get<BillingDashboardResponse>(
      withQuery(billingEndpoints.dashboard, params),
    ).then((res) => readBillingDashboard(res) ?? null),

  invoices: {
    list: (params: BillingInvoicesListParams = {}) =>
      get<BillingInvoicesListResponse>(withQuery(billingEndpoints.invoices, params)).then(
        normalizeInvoicesListResponse,
      ),

    get: (invoiceId: string) =>
      get<BillingInvoiceResponse>(
        billingEndpoints.invoiceById(invoiceId),
      )
        .then(normalizeInvoiceResponse)
        .then((res) => readBillingInvoice(res) ?? null),

    create: (body: CreateBillingInvoiceBody) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoices,
        body,
      ).then(normalizeInvoiceResponse),

    issue: (invoiceId: string, body?: { dueAt?: string }) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoiceIssue(invoiceId),
        body ?? {},
      ).then(normalizeInvoiceResponse),

    update: (invoiceId: string, body: UpdateBillingInvoiceBody) =>
      put<BillingInvoiceResponse>(
        billingEndpoints.invoiceById(invoiceId),
        body,
      ).then(normalizeInvoiceResponse),

    prefillVisit: (appointmentId: string) =>
      get<BillingInvoicePrefillResponse>(
        billingEndpoints.invoicePrefillVisit(appointmentId),
      ).then((res) => readBillingPrefill(res) ?? null),

    cancel: (invoiceId: string, body?: { reason?: string }) =>
      post<BillingInvoiceResponse>(
        billingEndpoints.invoiceCancel(invoiceId),
        body ?? {},
      ).then(normalizeInvoiceResponse),
  },

  refunds: {
    create: (body: CreateBillingRefundBody) =>
      post<BillingRefundResponse>(billingEndpoints.refunds, body),
  },

  payments: {
    list: (params: BillingPaymentsListParams = {}) =>
      get<BillingPaymentsListResponse>(withQuery(billingEndpoints.payments, params)).then(
        normalizePaymentsListResponse,
      ),

    create: (body: CreateBillingPaymentBody) =>
      post<BillingPaymentResponse>(
        billingEndpoints.payments,
        body,
      ).then(normalizePaymentResponse),
  },

  expenses: {
    list: (params: BillingExpensesListParams = {}) =>
      get<BillingExpensesListResponse>(withQuery(billingEndpoints.expenses, params)).then(
        normalizeExpensesListResponse,
      ),

    create: (body: CreateBillingExpenseBody) =>
      post<BillingExpenseResponse>(
        billingEndpoints.expenses,
        body,
      ).then(normalizeExpenseResponse),
  },

  reports: {
    get: (params: BillingQueryParams = {}) =>
      get<BillingReportResponse>(
        withQuery(billingEndpoints.reports, params),
      ).then((res) => readBillingReport(res) ?? null),

    exportPdf: (params: BillingQueryParams = {}) =>
      get<BillingReportExportResponse>(
        withQuery(billingEndpoints.reportsExportPdf, params),
      ),
  },

  settings: {
    get: () =>
      get<BillingSettingsResponse>(billingEndpoints.settings).then(
        normalizeSettingsResponse,
      ),

    update: (body: Partial<ApiBillingSettings>) =>
      put<BillingSettingsResponse>(
        billingEndpoints.settings,
        body,
      ).then(normalizeSettingsResponse),
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
      return get<BillingServicesListResponse>(path).then(
        normalizeServicesListResponse,
      );
    },

    get: (serviceId: string) =>
      get<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
      )
        .then(normalizeServiceResponse)
        .then((res) => readBillingService(res) ?? null),

    create: (body: CreateBillingServiceBody) =>
      post<BillingServiceResponse>(
        billingEndpoints.services,
        body,
      ).then(normalizeServiceResponse),

    update: (serviceId: string, body: UpdateBillingServiceBody) =>
      put<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
        body,
      ).then(normalizeServiceResponse),

    delete: (serviceId: string) =>
      del<BillingServiceResponse>(
        billingEndpoints.serviceById(serviceId),
      ).then(normalizeServiceResponse),
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
