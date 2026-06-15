export type InvoiceStatus =
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'overdue';

export type ExpenseCategory = 'rent' | 'salaries' | 'services' | 'materials';

export type AccountsPeriod = 'day' | 'week' | 'month' | 'custom';

export type ClinicInvoiceApiStatus =
  | 'draft'
  | 'issued'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type ClinicInvoice = {
  id: string;
  patientName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  paid: number;
  items: ClinicInvoiceItem[];
  payments: ClinicPayment[];
  discountPercent: number;
  taxPercent: number;
  /** Mongo id for API mutations */
  rawId?: string;
  currency?: string;
  remaining?: number;
  /** Raw API status (edit/refund rules) */
  apiStatus?: ClinicInvoiceApiStatus;
  patientId?: string;
  notes?: string | null;
  dueAtIso?: string | null;
};

export type ClinicInvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type ClinicPayment = {
  id: string;
  amount: number;
  method: string;
  date: string;
  /** Mongo id for refund API */
  rawId?: string;
  refundableAmount?: number;
  refundedAmount?: number;
};

export type ClinicExpense = {
  id: string;
  category: ExpenseCategory;
  title: string;
  date: string;
  amount: number;
  rawId?: string;
  currency?: string;
  rawCategory?: string;
};

export type RecentActivity = {
  id: string;
  title: string;
  timeLabel: string;
  amount: number;
  type: 'income' | 'expense';
  currency?: string;
};

export type AccountsSummary = {
  income: number;
  expenses: number;
  netProfit: number;
  unpaid: number;
  pending: number;
  payments: number;
};

export type WeeklyOverviewPoint = {
  week: string;
  income: number;
  expenses: number;
  profit: number;
};

export type MonthlyFinancePoint = {
  month: string;
  income: number;
  expenses: number;
  profit: number;
};

export type ExpenseBreakdownPoint = {
  category: ExpenseCategory;
  label: string;
  value: number;
  color: string;
};
