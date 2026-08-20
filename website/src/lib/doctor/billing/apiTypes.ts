export type ApiBillingInvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type ApiBillingPaymentMethod =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'insurance';

export type ApiBillingInvoicePatient = {
  id?: string;
  publicId?: string;
  fullName?: string;
};

export type ApiBillingInvoiceItem = {
  id?: string;
  billingServiceId?: string | null;
  appointmentTypeId?: string | null;
  serviceNameSnapshot?: string;
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
};

export type ApiBillingPayment = {
  id: string;
  number?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  patient?: ApiBillingInvoicePatient;
  amount?: number;
  refundedAmount?: number;
  refundableAmount?: number;
  refundStatus?: string;
  method?: ApiBillingPaymentMethod | string;
  paidAt?: string;
  note?: string;
};

export type ApiBillingRefund = {
  id: string;
  number?: string;
  paymentId?: string;
  amount?: number;
  reason?: string;
  refundedAt?: string;
};

export type ApiBillingInvoicePrefill = {
  sourceType?: 'visit' | 'manual' | string;
  appointmentId?: string;
  patient?: ApiBillingInvoicePatient;
  currency?: string;
  suggestedDueAt?: string;
  items?: ApiBillingInvoiceItem[];
};

export type ApiBillingService = {
  id: string;
  name?: string;
  defaultPrice?: number;
  durationMinutes?: number;
  description?: string | null;
  isActive?: boolean;
  appointmentType?: {
    id?: string;
    name?: string;
    price?: number;
  } | null;
  deletedAt?: string | null;
};

export type CreateBillingServiceBody = {
  name: string;
  defaultPrice?: number;
  durationMinutes?: number;
  description?: string;
  appointmentTypeId?: string;
  isActive?: boolean;
};

export type UpdateBillingServiceBody = Partial<CreateBillingServiceBody>;

export type BillingMutationEnvelope = {
  messageKey?: string;
  message?: string;
};

export type ApiBillingInvoice = {
  id: string;
  number?: string;
  sourceType?: 'manual' | 'visit' | string;
  status?: ApiBillingInvoiceStatus;
  refundStatus?: string;
  patient?: ApiBillingInvoicePatient;
  appointmentId?: string | null;
  currency?: string;
  discountPercent?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  total?: number;
  grossPaid?: number;
  totalRefunded?: number;
  netPaid?: number;
  remaining?: number;
  items?: ApiBillingInvoiceItem[];
  payments?: ApiBillingPayment[];
  refunds?: ApiBillingRefund[];
  dueAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  notes?: string | null;
};

export type ApiBillingExpense = {
  id: string;
  number?: string;
  category?: string;
  amount?: number;
  currency?: string;
  expenseDate?: string;
  description?: string;
};

export type ApiBillingSummary = {
  income?: number;
  expenses?: number;
  refunds?: number;
  profit?: number;
};

export type ApiBillingTrendBucket = {
  key?: string;
  label?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string | null;
  mixedCurrencies?: boolean;
  summary?: ApiBillingSummary;
  summaryByCurrency?: Array<ApiBillingSummary & { currency?: string }>;
  counts?: Record<string, number>;
};

export type ApiBillingDashboard = {
  currency?: string | null;
  currencies?: string[];
  mixedCurrencies?: boolean;
  summaryCurrencyScope?: string;
  summary?: ApiBillingSummary;
  summaryByCurrency?: Array<ApiBillingSummary & { currency?: string }>;
  trends?: {
    period?: string;
    periodAnchor?: string;
    groupBy?: string;
    dateFrom?: string;
    dateTo?: string;
    buckets?: ApiBillingTrendBucket[];
  };
  overdueSummary?: { count?: number; amount?: number };
  outstandingSummary?: { count?: number; amount?: number };
  charts?: {
    paymentsByMethod?: Array<{ label?: string; currency?: string; count?: number; amount?: number }>;
    invoiceTotalsByStatus?: Array<{ label?: string; currency?: string; count?: number; amount?: number }>;
    billedAmountByService?: Array<{ label?: string; currency?: string; count?: number; amount?: number }>;
    revenueByBillingService?: Array<{ label?: string; currency?: string; count?: number; amount?: number }>;
    expensesByCategory?: Array<{ label?: string; currency?: string; count?: number; amount?: number }>;
  };
};

export type ApiBillingReport = ApiBillingDashboard & {
  breakdowns?: ApiBillingDashboard['charts'] & {
    overdueSummary?: { count?: number; amount?: number };
    outstandingSummary?: { count?: number; amount?: number };
  };
  tables?: {
    invoices?: ApiBillingInvoice[];
    payments?: ApiBillingPayment[];
    refunds?: ApiBillingRefund[];
    expenses?: ApiBillingExpense[];
  };
};

export type ApiBillingSettings = {
  currency?: string;
  taxEnabled?: boolean;
  defaultTaxPercent?: number;
  discountPresets?: number[];
  allowedPaymentMethods?: ApiBillingPaymentMethod[];
  defaultInvoiceDueHours?: number;
  unpaidAlertAfterHours?: number;
  expenseCategories?: string[];
  updatedAt?: string;
};

export type ApiSupportedCurrency = {
  code: string;
  name?: string;
  symbol?: string;
  isDefault?: boolean;
};

export type CreateBillingInvoiceBody = {
  patientId: string;
  sourceType?: 'manual' | 'visit';
  appointmentId?: string;
  status?: 'draft' | 'issued';
  discountPercent?: number;
  items: Array<{
    billingServiceId?: string;
    appointmentTypeId?: string;
    serviceNameSnapshot: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueAt?: string;
  notes?: string;
};

export type CreateBillingPaymentBody = {
  invoiceId: string;
  amount: number;
  method: ApiBillingPaymentMethod | string;
  paidAt?: string;
  note?: string;
};

export type UpdateBillingInvoiceBody = CreateBillingInvoiceBody;

export type CreateBillingRefundBody = {
  paymentId: string;
  amount: number;
  reason?: string;
  refundedAt?: string;
};

export type CreateBillingExpenseBody = {
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
};

export type BillingInvoicesListResponse = BillingMutationEnvelope & {
  invoices?: ApiBillingInvoice[];
  total?: number;
  page?: number;
  limit?: number;
};

export type BillingInvoiceResponse = BillingMutationEnvelope & {
  invoice?: ApiBillingInvoice;
};

export type BillingInvoicePrefillResponse = BillingMutationEnvelope & {
  prefill?: ApiBillingInvoicePrefill;
};

export type BillingRefundResponse = BillingMutationEnvelope & {
  refund?: ApiBillingRefund;
  payment?: ApiBillingPayment;
  invoice?: ApiBillingInvoice;
};

export type BillingPaymentsListResponse = BillingMutationEnvelope & {
  payments?: ApiBillingPayment[];
  total?: number;
  page?: number;
  limit?: number;
};

export type BillingPaymentResponse = BillingMutationEnvelope & {
  payment?: ApiBillingPayment;
  invoice?: ApiBillingInvoice;
};

export type BillingExpensesListResponse = BillingMutationEnvelope & {
  expenses?: ApiBillingExpense[];
  total?: number;
  page?: number;
  limit?: number;
};

export type BillingExpenseResponse = BillingMutationEnvelope & {
  expense?: ApiBillingExpense;
};

export type BillingDashboardResponse = BillingMutationEnvelope & {
  dashboard?: ApiBillingDashboard;
};

export type BillingReportResponse = BillingMutationEnvelope & {
  report?: ApiBillingReport;
};

export type BillingReportExportResponse = BillingMutationEnvelope & {
  downloadUrl?: string;
  url?: string;
  fileName?: string;
  expiresIn?: number;
};

export type BillingSettingsResponse = BillingMutationEnvelope & {
  settings?: ApiBillingSettings;
  supportedCurrencies?: ApiSupportedCurrency[];
  defaultCurrency?: string;
};

export type BillingServicesListResponse = BillingMutationEnvelope & {
  services?: ApiBillingService[];
  total?: number;
  page?: number;
  limit?: number;
};

export type BillingServiceResponse = BillingMutationEnvelope & {
  service?: ApiBillingService;
};
