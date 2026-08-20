/** Doctor-scoped billing routes (API-3 `/api/billing`). */
export const billingEndpoints = {
  dashboard: '/api/billing/dashboard',
  invoices: '/api/billing/invoices',
  invoiceById: (invoiceId: string) =>
    `/api/billing/invoices/${encodeURIComponent(invoiceId)}`,
  invoicePrefillVisit: (appointmentId: string) =>
    `/api/billing/invoices/prefill/visit/${encodeURIComponent(appointmentId)}`,
  invoiceIssue: (invoiceId: string) =>
    `/api/billing/invoices/${encodeURIComponent(invoiceId)}/issue`,
  invoiceCancel: (invoiceId: string) =>
    `/api/billing/invoices/${encodeURIComponent(invoiceId)}/cancel`,
  payments: '/api/billing/payments',
  refunds: '/api/billing/refunds',
  expenses: '/api/billing/expenses',
  reports: '/api/billing/reports',
  reportsExportPdf: '/api/billing/reports/export.pdf',
  settings: '/api/billing/settings',
  services: '/api/billing/services',
  serviceById: (serviceId: string) =>
    `/api/billing/services/${encodeURIComponent(serviceId)}`,
} as const;
