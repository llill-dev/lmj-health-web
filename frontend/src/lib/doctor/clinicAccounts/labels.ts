import type {
  ExpenseCategory,
  InvoiceStatus,
} from "@/lib/doctor/clinicAccounts/types";

export function expenseCategoryLabel(
  category: ExpenseCategory,
  t: (key: string) => string = (key) => key,
): string {
  const labels: Record<ExpenseCategory, string> = {
    rent: t("doctor.clinicAccounts.expenseCategory.rent"),
    salaries: t("doctor.clinicAccounts.expenseCategory.salaries"),
    services: t("doctor.clinicAccounts.expenseCategory.services"),
    materials: t("doctor.clinicAccounts.expenseCategory.materials"),
  };
  return labels[category];
}

export function invoiceStatusLabel(
  status: InvoiceStatus,
  t: (key: string) => string = (key) => key,
): string {
  const labels: Record<InvoiceStatus, string> = {
    paid: t("doctor.clinicAccounts.invoiceStatus.paid"),
    unpaid: t("doctor.clinicAccounts.invoiceStatus.unpaid"),
    partial: t("doctor.clinicAccounts.invoiceStatus.partial"),
    overdue: t("doctor.clinicAccounts.invoiceStatus.overdue"),
    cancelled: t("doctor.clinicAccounts.invoiceStatus.cancelled"),
  };
  return labels[status];
}
