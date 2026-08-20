import type {
  ApiBillingDashboard,
  ApiBillingExpense,
  ApiBillingInvoice,
  ApiBillingPayment,
  ApiBillingReport,
  ApiBillingSummary,
} from '@/lib/doctor/billing/apiTypes';
import {
  formatBillingAmount,
  formatBillingDate,
} from '@/lib/doctor/billing/format';
import type {
  AccountsSummary,
  ClinicExpense,
  ClinicInvoice,
  ClinicPayment,
  ExpenseBreakdownPoint,
  ExpenseCategory,
  InvoiceStatus,
  MonthlyFinancePoint,
  RecentActivity,
  WeeklyOverviewPoint,
} from '@/lib/doctor/clinicAccounts/types';

const EXPENSE_COLORS = ['#0F8F8B', '#22C55E', '#F97316', '#EF4444', '#8B5CF6', '#0EA5E9'];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  insurance: 'تأمين',
};

function readArrayOrEmpty<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function readInvoiceItems(value: ApiBillingInvoice['items']): NonNullable<ApiBillingInvoice['items']> {
  return readArrayOrEmpty(value);
}

function formatIsoDate(value?: string | null): string {
  return formatBillingDate(value);
}

function formatRelativeTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'الآن';
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'أمس';
  return `منذ ${days} يوم`;
}

export function mapApiInvoiceStatus(
  status?: string,
): InvoiceStatus {
  switch (status) {
    case 'paid':
      return 'paid';
    case 'partial':
      return 'partial';
    case 'overdue':
      return 'overdue';
    case 'cancelled':
      return 'cancelled';
    case 'issued':
    case 'draft':
    default:
      return 'unpaid';
  }
}

export function mapUiInvoiceStatusToApi(
  status: InvoiceStatus | 'all',
): string | undefined {
  switch (status) {
    case 'paid':
      return 'paid';
    case 'partial':
      return 'partial';
    case 'overdue':
      return 'overdue';
    case 'cancelled':
      return 'cancelled';
    case 'unpaid':
      return 'issued';
    default:
      return undefined;
  }
}

function guessExpenseCategory(category?: string): ExpenseCategory {
  const lower = (category ?? '').toLowerCase();
  if (lower.includes('rent') || lower.includes('إيجار')) return 'rent';
  if (lower.includes('salary') || lower.includes('رواتب')) return 'salaries';
  if (lower.includes('material') || lower.includes('supply') || lower.includes('مواد')) {
    return 'materials';
  }
  return 'services';
}

export function mapApiInvoiceToClinicInvoice(
  invoice: ApiBillingInvoice,
): ClinicInvoice {
  const subtotal = invoice.subtotal ?? 0;
  const taxAmount = invoice.taxAmount ?? 0;
  const taxPercent =
    subtotal > 0 ? Math.round((taxAmount / subtotal) * 10000) / 100 : 0;

  return {
    id: invoice.number ?? invoice.id,
    patientName: invoice.patient?.fullName ?? '—',
    issueDate: formatIsoDate(invoice.createdAt),
    dueDate: formatIsoDate(invoice.dueAt),
    status: mapApiInvoiceStatus(invoice.status),
    total: invoice.total ?? 0,
    paid: invoice.grossPaid ?? invoice.netPaid ?? 0,
    discountPercent: invoice.discountPercent ?? 0,
    taxPercent,
    items: readInvoiceItems(invoice.items).map((item, index) => ({
      id: item.id ?? `item-${index}`,
      name: item.serviceNameSnapshot ?? item.description ?? 'خدمة',
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
    })),
    payments: readArrayOrEmpty(invoice.payments).map(mapApiPaymentToClinicPayment),
    currency: invoice.currency,
    rawId: invoice.id,
    remaining: invoice.remaining,
    apiStatus: invoice.status,
    patientId: invoice.patient?.id,
    notes: invoice.notes,
    dueAtIso: invoice.dueAt,
  };
}

export function mapApiPaymentToClinicPayment(
  payment: ApiBillingPayment,
): ClinicPayment {
  const amount = payment.amount ?? 0;
  const refundedAmount = payment.refundedAmount ?? 0;
  const refundableAmount =
    payment.refundableAmount ??
    Math.max(0, amount - refundedAmount);

  return {
    id: payment.number ?? payment.id,
    rawId: payment.id,
    amount,
    refundedAmount,
    refundableAmount,
    method: PAYMENT_METHOD_LABELS[payment.method ?? ''] ?? payment.method ?? '—',
    date: formatIsoDate(payment.paidAt),
  };
}

export function mapApiExpenseToClinicExpense(
  expense: ApiBillingExpense,
): ClinicExpense {
  const mapped: ClinicExpense = {
    id: expense.number ?? expense.id,
    category: guessExpenseCategory(expense.category),
    title: expense.description ?? expense.category ?? 'مصروف',
    date: formatIsoDate(expense.expenseDate),
    amount: expense.amount ?? 0,
    currency: expense.currency,
    rawId: expense.id,
    rawCategory: expense.category,
  };
  return mapped;
}

function pickSummary(
  dashboard: ApiBillingDashboard,
): ApiBillingSummary {
  if (dashboard.mixedCurrencies && dashboard.summaryByCurrency?.length) {
    return dashboard.summaryByCurrency[0] ?? {};
  }
  return dashboard.summary ?? {};
}

export function mapDashboardToAccountsSummary(
  dashboard: ApiBillingDashboard,
): AccountsSummary {
  const summary = pickSummary(dashboard);
  return {
    income: summary.income ?? 0,
    expenses: summary.expenses ?? 0,
    netProfit: summary.profit ?? 0,
    unpaid: dashboard.outstandingSummary?.amount ?? 0,
    pending: dashboard.overdueSummary?.amount ?? 0,
    payments: dashboard.charts?.paymentsByMethod?.reduce(
      (sum, row) => sum + (row.count ?? 0),
      0,
    ) ?? 0,
  };
}

export function mapDashboardTrendsToWeeklyOverview(
  dashboard: ApiBillingDashboard,
): WeeklyOverviewPoint[] {
  const buckets = dashboard.trends?.buckets ?? [];
  return readArrayOrEmpty(buckets).map((bucket) => {
    const summary = bucket.summaryByCurrency?.[0] ?? bucket.summary ?? {};
    return {
      week: bucket.label ?? bucket.key ?? '—',
      income: summary.income ?? 0,
      expenses: summary.expenses ?? 0,
      profit: summary.profit ?? 0,
    };
  });
}

export function mapReportTrendsToMonthlyFinance(
  report: ApiBillingReport,
): MonthlyFinancePoint[] {
  const buckets = report.trends?.buckets ?? [];
  return readArrayOrEmpty(buckets).map((bucket) => {
    const summary = bucket.summaryByCurrency?.[0] ?? bucket.summary ?? {};
    return {
      month: bucket.label ?? bucket.key ?? '—',
      income: summary.income ?? 0,
      expenses: summary.expenses ?? 0,
      profit: summary.profit ?? 0,
    };
  });
}

export function mapExpensesByCategory(
  report: ApiBillingReport,
): ExpenseBreakdownPoint[] {
  const rows =
    report.breakdowns?.expensesByCategory ??
    report.charts?.expensesByCategory ??
    [];

  return readArrayOrEmpty(rows).map((row, index) => ({
    category: guessExpenseCategory(row.label),
    label: row.label ?? 'أخرى',
    value: row.amount ?? 0,
    color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
  }));
}

export function mapRecentActivitiesFromReport(
  report: ApiBillingReport,
  currency = 'USD',
): RecentActivity[] {
  const payments = readArrayOrEmpty(report.tables?.payments).slice(0, 5).map((payment) => ({
    id: `pay-${payment.id}`,
    title: `دفعة - ${payment.invoiceNumber ?? payment.invoiceId ?? ''}`,
    timeLabel: formatRelativeTime(payment.paidAt),
    amount: payment.amount ?? 0,
    type: 'income' as const,
    currency,
  }));

  const expenses = readArrayOrEmpty(report.tables?.expenses).slice(0, 3).map((expense) => ({
    id: `exp-${expense.id}`,
    title: expense.description ?? expense.category ?? 'مصروف',
    timeLabel: formatRelativeTime(expense.expenseDate),
    amount: expense.amount ?? 0,
    type: 'expense' as const,
    currency: expense.currency ?? currency,
  }));

  return [...payments, ...expenses]
    .sort((a, b) => 0)
    .slice(0, 6);
}

export function formatSummaryLabel(
  value: number,
  currency?: string | null,
): string {
  return formatBillingAmount(value, currency ?? 'USD');
}
