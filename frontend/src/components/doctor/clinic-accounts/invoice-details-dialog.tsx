'use client';

import { FileText, Plus, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ClinicInvoice } from '@/lib/doctor/clinicAccounts/types';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import {
  calcInvoiceTotals,
  formatUsd,
} from '@/lib/doctor/clinicAccounts/mockData';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { InvoiceStatusBadge } from '@/components/doctor/clinic-accounts/invoice-status-badge';

export function InvoiceDetailsDialog({
  open,
  invoice,
  onClose,
}: {
  open: boolean;
  invoice: ClinicInvoice | null;
  onClose: () => void;
}) {
  if (!invoice) return null;

  const { subtotal, discount, tax, total, remaining } = calcInvoiceTotals(invoice);

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="تفاصيل الفاتورة"
      headerPattern
      maxWidthClass="max-w-[760px]"
    >
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#EEF2F6] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <InvoiceStatusBadge status={invoice.status} />
            <div className="text-right">
              <p className="font-cairo text-[20px] font-black text-[#111827]">
                {invoice.id}
              </p>
              <p className="mt-1 font-cairo text-[14px] font-bold text-[#667085]">
                {invoice.patientName}
              </p>
              <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                تاريخ الإصدار: {invoice.issueDate}
              </p>
            </div>
          </div>
          <p className="mt-3 text-left font-cairo text-[12px] font-semibold text-[#98A2B3]">
            تاريخ الاستحقاق: {invoice.dueDate}
          </p>
        </div>

        <div className="rounded-[12px] bg-[#F0FDFA] p-5">
          <h3 className="mb-4 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
            الملخص المالي
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'الإجمالي', value: formatUsd(total), tone: 'text-[#111827]' },
              { label: 'المدفوع', value: formatUsd(invoice.paid), tone: 'text-primary' },
              { label: 'المتبقي', value: formatUsd(remaining), tone: 'text-[#F97316]' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[10px] border border-[#EEF2F6] bg-white px-3 py-4 text-center"
              >
                <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                  {item.label}
                </p>
                <p className={`mt-2 font-cairo text-[18px] font-black ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#EEF2F6] p-5">
          <h3 className="mb-4 text-right font-cairo text-[14px] font-extrabold text-[#111827]">
            البنود
          </h3>
          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
              >
                <div className="text-left">
                  <p className="font-cairo text-[14px] font-extrabold text-primary">
                    {formatUsd(item.quantity * item.unitPrice)}
                  </p>
                  <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    {formatUsd(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                    {item.name}
                  </p>
                  <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    الكمية: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-[#EEF2F6] pt-4 text-left">
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              المجموع الفرعي: {formatUsd(subtotal)}
            </p>
            {discount > 0 ? (
              <p className="font-cairo text-[12px] font-semibold text-[#F97316]">
                الخصم {invoice.discountPercent}%: -{formatUsd(discount)}
              </p>
            ) : null}
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              الضريبة {invoice.taxPercent}%: {formatUsd(tax)}
            </p>
            <p className="font-cairo text-[18px] font-black text-primary">
              الإجمالي: {formatUsd(total)}
            </p>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#EEF2F6] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to={`/doctor/accounts/payments/new?invoice=${encodeURIComponent(invoice.rawId ?? invoice.id)}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden />
              إضافة دفعة
            </Link>
            <h3 className="font-cairo text-[14px] font-extrabold text-[#111827]">
              الدفعات
            </h3>
          </div>
          {invoice.payments.length ? (
            <div className="space-y-2">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-[10px] bg-[#F0FDFA] px-4 py-3"
                >
                  <span className="font-cairo text-[15px] font-black text-primary">
                    {formatUsd(payment.amount)}
                  </span>
                  <div className="text-right">
                    <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {payment.id}
                    </p>
                    <p className="font-cairo text-[11px] font-semibold text-[#667085]">
                      {payment.method} • {payment.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center font-cairo text-[13px] font-semibold text-[#98A2B3]">
              لا توجد دفعات بعد
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary"
          >
            تعديل
          </button>
          <button
            type="button"
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white"
          >
            <Receipt className="h-4 w-4" aria-hidden />
            استرجاع
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}

export function RecentActivityList({
  activities,
}: {
  activities: import('@/lib/doctor/clinicAccounts/types').RecentActivity[];
}) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3"
        >
          <span
            className={
              activity.type === 'income'
                ? 'font-cairo text-[14px] font-black text-primary'
                : 'font-cairo text-[14px] font-black text-[#DC2626]'
            }
          >
            {activity.type === 'income' ? '+' : '-'}
            {formatBillingAmount(activity.amount, activity.currency ?? 'USD')}
          </span>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {activity.title}
              </p>
              <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                {activity.timeLabel}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDFA] text-primary">
              <FileText className="h-4 w-4" aria-hidden />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
