import type { ClinicInvoice } from '@/lib/doctor/clinicAccounts/types';

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
