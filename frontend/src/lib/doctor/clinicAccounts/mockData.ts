import type {
  AccountsSummary,
  ClinicExpense,
  ClinicInvoice,
  ExpenseBreakdownPoint,
  MonthlyFinancePoint,
  RecentActivity,
  WeeklyOverviewPoint,
} from '@/lib/doctor/clinicAccounts/types';

export const ACCOUNTS_SUMMARY: AccountsSummary = {
  income: 10000,
  expenses: 6000,
  netProfit: 4000,
  unpaid: 2000,
  pending: 1400,
  payments: 150,
};

export const WEEKLY_OVERVIEW: WeeklyOverviewPoint[] = [
  { week: 'الأسبوع 1', income: 3200, expenses: 1800, profit: 1400 },
  { week: 'الأسبوع 2', income: 2800, expenses: 2100, profit: 700 },
  { week: 'الأسبوع 3', income: 4000, expenses: 2100, profit: 1900 },
];

export const MONTHLY_FINANCE: MonthlyFinancePoint[] = [
  { month: 'يناير', income: 12000, expenses: 5000, profit: 7000 },
  { month: 'فبراير', income: 14000, expenses: 6000, profit: 8000 },
  { month: 'مارس', income: 15000, expenses: 5500, profit: 9500 },
  { month: 'أبريل', income: 18000, expenses: 7000, profit: 11000 },
];

export const EXPENSE_BREAKDOWN: ExpenseBreakdownPoint[] = [
  { category: 'salaries', label: 'رواتب', value: 12000, color: '#0F8F8B' },
  { category: 'rent', label: 'إيجار', value: 5000, color: '#22C55E' },
  { category: 'materials', label: 'مواد', value: 3000, color: '#F97316' },
  { category: 'services', label: 'خدمات', value: 2000, color: '#EF4444' },
];

export const MOCK_INVOICES: ClinicInvoice[] = [
  {
    id: 'INV-1245',
    patientName: 'أحمد محمد',
    issueDate: '2026-04-10',
    dueDate: '2026-04-20',
    status: 'partial',
    total: 575,
    paid: 300,
    discountPercent: 10,
    taxPercent: 15,
    items: [
      { id: '1', name: 'استشارة', quantity: 1, unitPrice: 150 },
      { id: '2', name: 'أشعة', quantity: 1, unitPrice: 200 },
      { id: '3', name: 'تحليل دم', quantity: 1, unitPrice: 100 },
    ],
    payments: [
      { id: 'PAY-001', amount: 300, method: 'نقدي', date: '2026-04-11' },
    ],
  },
  {
    id: 'INV-1244',
    patientName: 'سارة علي',
    issueDate: '2026-04-08',
    dueDate: '2026-04-18',
    status: 'overdue',
    total: 300,
    paid: 0,
    discountPercent: 0,
    taxPercent: 15,
    items: [{ id: '1', name: 'فحص', quantity: 1, unitPrice: 300 }],
    payments: [],
  },
  {
    id: 'INV-1243',
    patientName: 'محمد خالد',
    issueDate: '2026-04-12',
    dueDate: '2026-04-22',
    status: 'paid',
    total: 450,
    paid: 450,
    discountPercent: 0,
    taxPercent: 15,
    items: [{ id: '1', name: 'زيارة', quantity: 1, unitPrice: 450 }],
    payments: [
      { id: 'PAY-002', amount: 450, method: 'بطاقة', date: '2026-04-12' },
    ],
  },
  {
    id: 'INV-1242',
    patientName: 'فاطمة أحمد',
    issueDate: '2026-04-11',
    dueDate: '2026-04-21',
    status: 'unpaid',
    total: 200,
    paid: 0,
    discountPercent: 0,
    taxPercent: 15,
    items: [{ id: '1', name: 'متابعة', quantity: 1, unitPrice: 200 }],
    payments: [],
  },
];

export const MOCK_EXPENSES: ClinicExpense[] = [
  {
    id: 'EXP-001',
    category: 'rent',
    title: 'إيجار العيادة - أبريل',
    date: '2026-04-01',
    amount: 2000,
  },
  {
    id: 'EXP-002',
    category: 'salaries',
    title: 'رواتب الموظفين - أبريل',
    date: '2026-04-05',
    amount: 3000,
  },
  {
    id: 'EXP-003',
    category: 'materials',
    title: 'مستلزمات ومواد طبية',
    date: '2026-04-10',
    amount: 500,
  },
  {
    id: 'EXP-004',
    category: 'services',
    title: 'كهرباء وماء وإنترنت',
    date: '2026-04-12',
    amount: 300,
  },
];

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 'ACT-1',
    title: 'دفعة - INV-1245',
    timeLabel: 'منذ ساعة',
    amount: 150,
    type: 'income',
  },
  {
    id: 'ACT-2',
    title: 'إيجار',
    timeLabel: 'منذ 3 ساعات',
    amount: 200,
    type: 'expense',
  },
  {
    id: 'ACT-3',
    title: 'فاتورة - INV-1243',
    timeLabel: 'أمس',
    amount: 450,
    type: 'income',
  },
];

export const EXPENSE_CATEGORY_LABELS: Record<
  import('@/lib/doctor/clinicAccounts/types').ExpenseCategory,
  string
> = {
  rent: 'إيجار',
  salaries: 'رواتب',
  services: 'خدمات',
  materials: 'مواد',
};

export const INVOICE_STATUS_LABELS: Record<
  import('@/lib/doctor/clinicAccounts/types').InvoiceStatus,
  string
> = {
  paid: 'مدفوع',
  unpaid: 'غير مدفوع',
  partial: 'مدفوع جزئياً',
  overdue: 'متأخرة',
};

export { formatUsd, formatBillingAmount, formatBillingNumber } from '@/lib/doctor/billing/format';

export function calcInvoiceTotals(invoice: ClinicInvoice) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discount = subtotal * (invoice.discountPercent / 100);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (invoice.taxPercent / 100);
  const computedTotal = afterDiscount + tax;
  const total = invoice.total > 0 ? invoice.total : computedTotal;
  const remaining =
    typeof invoice.remaining === 'number'
      ? invoice.remaining
      : Math.max(0, total - invoice.paid);
  return { subtotal, discount, tax, total, remaining };
}
