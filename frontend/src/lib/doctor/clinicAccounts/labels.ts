import type { ExpenseCategory, InvoiceStatus } from '@/lib/doctor/clinicAccounts/types';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'إيجار',
  salaries: 'رواتب',
  services: 'خدمات',
  materials: 'مواد',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'مدفوع',
  unpaid: 'غير مدفوع',
  partial: 'مدفوع جزئياً',
  overdue: 'متأخرة',
  cancelled: 'ملغاة',
};
