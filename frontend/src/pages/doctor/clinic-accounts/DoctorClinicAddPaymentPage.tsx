'use client';

import { CreditCard, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClinicAccountsBanner,
  ClinicAccountsSubNav,
} from '@/components/doctor/clinic-accounts';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorInlineDetailsSkeleton } from '@/components/doctor/shared/skeletons';
import {
  useBillingInvoice,
  useBillingSettings,
  useCreateBillingPayment,
} from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import { calcInvoiceTotals } from '@/lib/doctor/clinicAccounts/mockData';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils/utils';

const METHOD_LABELS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  insurance: 'تأمين',
};

export default function DoctorClinicAddPaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const invoiceParam = searchParams.get('invoice') ?? '';

  const settingsQuery = useBillingSettings();
  const invoiceQuery = useBillingInvoice(invoiceParam, Boolean(invoiceParam));
  const createPayment = useCreateBillingPayment();

  const invoice = invoiceQuery.invoice;
  const currency = invoice?.currency ?? settingsQuery.currency;

  const totals = useMemo(
    () => (invoice ? calcInvoiceTotals(invoice) : null),
    [invoice],
  );

  const methods = settingsQuery.settings?.allowedPaymentMethods?.length
    ? settingsQuery.settings.allowedPaymentMethods
    : ['cash', 'card', 'bank_transfer', 'insurance'];

  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState<string>('cash');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (totals?.remaining != null) {
      setAmount(String(totals.remaining));
    }
  }, [totals?.remaining]);

  const handleSave = async () => {
    if (!invoice?.rawId) {
      toast('معرّف الفاتورة غير صالح.', {
        title: 'خطأ',
        variant: 'error',
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast('أدخل مبلغ دفعة صالحاً.', {
        title: 'مبلغ غير صالح',
        variant: 'error',
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        invoiceId: invoice.rawId,
        amount: parsedAmount,
        method,
        paidAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        note: notes.trim() || undefined,
      });

      toast('تم حفظ الدفعة بنجاح.', {
        title: 'تم الحفظ',
        variant: 'success',
      });
      navigate('/doctor/accounts/invoices');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر حفظ الدفعة',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>إضافة دفعة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="إضافة دفعة"
          subtitle="تسجيل دفعة جديدة على الفاتورة"
          icon={<CreditCard className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        {!invoiceParam ? (
          <DoctorListErrorState
            title="فاتورة غير محددة"
            brief="افتح هذه الصفحة من فاتورة محددة أو أضف ?invoice=<id> في الرابط."
            onRetry={() => navigate('/doctor/accounts/invoices')}
          />
        ) : invoiceQuery.isLoading ? (
          <DoctorInlineDetailsSkeleton rows={4} />
        ) : invoiceQuery.isError || !invoice || !totals ? (
          <DoctorListErrorState
            title="تعذّر تحميل الفاتورة"
            brief={getUserFacingRequestErrorMessage(invoiceQuery.error)}
            retrying={invoiceQuery.isFetching}
            onRetry={() => void invoiceQuery.refetch()}
          />
        ) : (
          <>
            <section className="mb-5 rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
              <div className="mb-4 text-right">
                <p className="font-cairo text-[18px] font-black text-[#111827]">
                  {invoice.id}
                </p>
                <p className="font-cairo text-[14px] font-bold text-[#667085]">
                  {invoice.patientName}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">الإجمالي</p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#111827]">
                    {formatBillingAmount(totals.total, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">المدفوع</p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-primary">
                    {formatBillingAmount(invoice.paid, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">المتبقي</p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#DC2626]">
                    {formatBillingAmount(totals.remaining, currency)}
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-5">
              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  المبلغ
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </section>

              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  طريقة الدفع
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {methods.map((option) => {
                    const active = method === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMethod(option)}
                        className={cn(
                          'rounded-[12px] border px-4 py-5 text-center transition',
                          active
                            ? 'border-primary bg-[#F0FDFA] text-primary'
                            : 'border-[#EEF2F6] bg-white text-[#667085]',
                        )}
                      >
                        <CreditCard className="mx-auto mb-2 h-5 w-5" aria-hidden />
                        <span className="font-cairo text-[13px] font-extrabold">
                          {METHOD_LABELS[option] ?? option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </section>

              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  ملاحظات
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="وصف ملاحظات..."
                  className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </section>

              <button
                type="button"
                disabled={createPayment.isPending}
                onClick={() => void handleSave()}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden />
                {createPayment.isPending ? 'جاري الحفظ...' : 'حفظ الدفعة'}
              </button>

              <Link
                to="/doctor/accounts/invoices"
                className="inline-block font-cairo text-[13px] font-extrabold text-[#667085]"
              >
                الرجوع إلى الفواتير ←
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
