'use client';

import { Receipt, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { useToast } from '@/components/ui/ToastProvider';
import { useCreateBillingRefund } from '@/hooks/doctor/billing';
import {
  billingOptionalTransactionDateToIso,
  billingTodayDateInput,
  BILLING_FUTURE_DATE_MESSAGE,
  isBillingDateInputAfterToday,
} from '@/lib/doctor/billing/dateInput';
import { getBillingRefundErrorToast } from '@/lib/doctor/billing/errors';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import type { ClinicInvoice, ClinicPayment } from '@/lib/doctor/clinicAccounts/types';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

function getRefundablePayments(invoice: ClinicInvoice): ClinicPayment[] {
  return invoice.payments.filter((payment) => {
    const refundable =
      payment.refundableAmount ??
      Math.max(0, payment.amount - (payment.refundedAmount ?? 0));
    return refundable > 0 && Boolean(payment.rawId);
  });
}

export function InvoiceRefundDialog({
  open,
  invoice,
  onClose,
  onSuccess,
}: {
  open: boolean;
  invoice: ClinicInvoice | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const createRefund = useCreateBillingRefund();

  const currency = invoice?.currency ?? 'USD';
  const refundablePayments = useMemo(
    () => (invoice ? getRefundablePayments(invoice) : []),
    [invoice],
  );

  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');

  const selectedPayment = refundablePayments.find((p) => p.rawId === paymentId);
  const maxRefundable =
    selectedPayment?.refundableAmount ??
    Math.max(
      0,
      (selectedPayment?.amount ?? 0) - (selectedPayment?.refundedAmount ?? 0),
    );

  useEffect(() => {
    if (!open || !invoice) return;
    const first = refundablePayments[0];
    setPaymentId(first?.rawId ?? '');
    setAmount(first ? String(first.refundableAmount ?? first.amount) : '');
    setReason('');
    setDate('');
  }, [open, invoice, refundablePayments]);

  useEffect(() => {
    if (!selectedPayment) return;
    setAmount(String(maxRefundable));
  }, [paymentId, maxRefundable, selectedPayment]);

  if (!invoice) return null;

  const handleSubmit = async () => {
    if (!paymentId) {
      toast('اختر دفعة لاسترجاع مبلغ منها.', {
        title: 'دفعة مطلوبة',
        variant: 'error',
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast('أدخل مبلغ استرجاع صالحاً.', {
        title: 'مبلغ غير صالح',
        variant: 'error',
      });
      return;
    }

    if (parsedAmount > maxRefundable) {
      toast(
        `المبلغ يتجاوز القابل للاسترداد (${formatBillingAmount(maxRefundable, currency)}).`,
        {
          title: 'مبلغ كبير',
          variant: 'error',
        },
      );
      return;
    }

    if (!reason.trim()) {
      toast('أدخل سبب الاسترجاع.', {
        title: 'السبب مطلوب',
        variant: 'error',
      });
      return;
    }

    if (isBillingDateInputAfterToday(date)) {
      toast(BILLING_FUTURE_DATE_MESSAGE.message, {
        title: BILLING_FUTURE_DATE_MESSAGE.title,
        variant: 'error',
      });
      return;
    }

    try {
      await createRefund.mutateAsync({
        paymentId,
        amount: parsedAmount,
        reason: reason.trim(),
        refundedAt: billingOptionalTransactionDateToIso(date),
      });

      toast('تم تسجيل الاسترجاع بنجاح.', {
        title: 'تم الاسترجاع',
        variant: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const { title, message } = getBillingRefundErrorToast(error);
      toast(message, { title, variant: 'error' });
    }
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="استرجاع دفعة"
      headerPattern
      maxWidthClass="max-w-[640px]"
    >
      <div dir={dir} lang={locale} className="space-y-5">
        <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 text-start">
          <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
            {invoice.id} • {invoice.patientName}
          </p>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            الاسترجاع يُنشأ من دفعة محددة — وليس مباشرة من الفاتورة.
          </p>
        </div>

        {refundablePayments.length === 0 ? (
          <div className="rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-5 text-center">
            <RotateCcw className="mx-auto mb-2 h-8 w-8 text-[#DC2626]" aria-hidden />
            <p className="font-cairo text-[14px] font-extrabold text-[#DC2626]">
              لا توجد دفعات قابلة للاسترداد
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#991B1B]">
              أضف دفعة أولاً أو تم استرداد كامل المبلغ المدفوع.
            </p>
          </div>
        ) : (
          <>
            <section>
              <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                اختر الدفعة
              </h3>
              <div className="space-y-2">
                {refundablePayments.map((payment) => {
                  const refundable =
                    payment.refundableAmount ??
                    Math.max(0, payment.amount - (payment.refundedAmount ?? 0));
                  const active = paymentId === payment.rawId;
                  return (
                    <button
                      key={payment.rawId}
                      type="button"
                      onClick={() => setPaymentId(payment.rawId ?? '')}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-start transition',
                        active
                          ? 'border-primary bg-[#F0FDFA] shadow-sm'
                          : 'border-[#EEF2F6] bg-white hover:border-primary/30',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                          {payment.id}
                        </p>
                        <p className="font-cairo text-[11px] font-semibold text-[#667085]">
                          {payment.method} • {payment.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="font-cairo text-[14px] font-black text-primary tabular-nums">
                          {formatBillingAmount(payment.amount, currency)}
                        </p>
                        <p className="font-cairo text-[11px] font-semibold text-[#667085] tabular-nums">
                          قابل للاسترداد: {formatBillingAmount(refundable, currency)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <label className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                  مبلغ الاسترجاع
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  max={maxRefundable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
                {selectedPayment ? (
                  <p className="mt-1 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    الحد الأقصى: {formatBillingAmount(maxRefundable, currency)}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                  سبب الاسترجاع
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="مثال: تصحيح دفعة زائدة، إلغاء جزء من الخدمة..."
                  className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#111827]">
                  تاريخ الاسترجاع (اختياري)
                </label>
                <p className="mb-2 text-start font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  اتركه فارغاً أو اختر اليوم لاستخدام وقت التسجيل الحالي. للأيام السابقة اختر
                  التاريخ المناسب.
                </p>
                <input
                  type="date"
                  value={date}
                  max={billingTodayDateInput()}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next && isBillingDateInputAfterToday(next)) return;
                    setDate(next);
                  }}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </div>
            </section>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] font-cairo text-[14px] font-extrabold text-[#667085]"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={createRefund.isPending || refundablePayments.length === 0}
            onClick={() => void handleSubmit()}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            <Receipt className="h-4 w-4" aria-hidden />
            {createRefund.isPending ? 'جاري التسجيل...' : 'تأكيد الاسترجاع'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
