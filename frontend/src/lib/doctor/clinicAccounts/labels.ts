import type { ExpenseCategory, InvoiceStatus } from '@/lib/doctor/clinicAccounts/types';

export function expenseCategoryLabel(
  category: ExpenseCategory,
  tr: (ar: string, en: string) => string = (ar) => ar,
): string {
  const labels: Record<ExpenseCategory, [string, string]> = {
    rent: ['إيجار', 'Rent'],
    salaries: ['رواتب', 'Salaries'],
    services: ['خدمات', 'Services'],
    materials: ['مواد', 'Materials'],
  };
  return tr(...labels[category]);
}

export function invoiceStatusLabel(
  status: InvoiceStatus,
  tr: (ar: string, en: string) => string = (ar) => ar,
): string {
  const labels: Record<InvoiceStatus, [string, string]> = {
    paid: ['مدفوع', 'Paid'],
    unpaid: ['غير مدفوع', 'Unpaid'],
    partial: ['مدفوع جزئياً', 'Partially paid'],
    overdue: ['متأخرة', 'Overdue'],
    cancelled: ['ملغاة', 'Cancelled'],
  };
  return tr(...labels[status]);
}
