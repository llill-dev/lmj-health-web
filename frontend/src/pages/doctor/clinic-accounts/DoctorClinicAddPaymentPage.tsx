"use client";

import { CreditCard, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ClinicAccountsBanner,
  ClinicAccountsSubNav,
} from "@/components/doctor/clinic-accounts";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorInlineDetailsSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useBillingSettings,
  useCreateBillingPayment,
  useResolvedBillingInvoice,
} from "@/hooks/doctor/billing";
import {
  getBillingInvoiceLoadErrorToast,
  getBillingPaymentErrorToast,
} from "@/lib/doctor/billing/errors";
import { formatBillingAmount } from "@/lib/doctor/billing/format";
import { calcInvoiceTotals } from "@/lib/doctor/clinicAccounts/invoiceTotals";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/utils";

const METHOD_LABELS: Record<string, string> = {
  cash: "نقدي",
  card: "بطاقة",
  bank_transfer: "تحويل بنكي",
  insurance: "تأمين",
};

import {
  billingOptionalTransactionDateToIso,
  billingTodayDateInput,
  BILLING_FUTURE_DATE_MESSAGE,
  isBillingDateInputAfterToday,
} from "@/lib/doctor/billing/dateInput";
import { useRetryAction } from "@/lib/query/useRetryAction";

export default function DoctorClinicAddPaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const invoiceParam = searchParams.get("invoice") ?? "";

  const settingsQuery = useBillingSettings();
  const invoiceQuery = useResolvedBillingInvoice(invoiceParam);
  const createPayment = useCreateBillingPayment();
  const { retry: retryInvoice, retrying: retryingInvoice } = useRetryAction(() =>
    invoiceQuery.refetch(),
  );

  const invoice = invoiceQuery.invoice;
  const currency = invoice?.currency ?? settingsQuery.currency;

  const totals = useMemo(
    () => (invoice ? calcInvoiceTotals(invoice) : null),
    [invoice],
  );

  const methods = settingsQuery.settings?.allowedPaymentMethods?.length
    ? settingsQuery.settings.allowedPaymentMethods
    : ["cash", "card", "bank_transfer", "insurance"];

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("cash");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const canAcceptPayment = Boolean(totals && totals.remaining > 0);

  useEffect(() => {
    if (totals?.remaining != null && totals.remaining > 0) {
      setAmount(String(totals.remaining));
    } else if (totals?.remaining === 0) {
      setAmount("");
    }
  }, [totals?.remaining]);

  const handleSave = async () => {
    if (!invoice?.rawId) {
      toast("معرّف الفاتورة غير صالح.", {
        title: "خطأ",
        variant: "error",
      });
      return;
    }

    if (!canAcceptPayment) {
      toast("لا يوجد مبلغ متبقٍ على هذه الفاتورة.", {
        title: "لا يمكن إضافة دفعة",
        variant: "error",
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast("أدخل مبلغ دفعة صالحاً.", {
        title: "مبلغ غير صالح",
        variant: "error",
      });
      return;
    }

    if (totals && parsedAmount > totals.remaining) {
      toast(
        `المبلغ يتجاوز المتبقي (${formatBillingAmount(totals.remaining, currency)}).`,
        {
          title: "مبلغ غير صالح",
          variant: "error",
        },
      );
      return;
    }

    if (isBillingDateInputAfterToday(date)) {
      toast(BILLING_FUTURE_DATE_MESSAGE.message, {
        title: BILLING_FUTURE_DATE_MESSAGE.title,
        variant: "error",
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        invoiceId: invoice.rawId,
        amount: parsedAmount,
        method,
        // Omit paidAt when unset or today — server stamps payment time (explicit ISO can trigger futureDateNotAllowed).
        paidAt: billingOptionalTransactionDateToIso(date),
        note: notes.trim() || undefined,
      });

      toast("تم حفظ الدفعة بنجاح.", {
        title: "تم الحفظ",
        variant: "success",
      });
      navigate("/doctor/accounts/invoices");
    } catch (error) {
      const { title, message } = getBillingPaymentErrorToast(error);
      toast(message, {
        title,
        variant: "error",
      });
    }
  };

  const loadErrorToast = invoiceQuery.error
    ? getBillingInvoiceLoadErrorToast(invoiceQuery.error)
    : null;

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
            brief="افتح هذه الصفحة من تفاصيل فاتورة (زر «إضافة دفعة») أو من قائمة الفواتير."
            onRetry={() => navigate("/doctor/accounts/invoices")}
          />
        ) : invoiceQuery.isAwaitingData ? (
          <DoctorInlineDetailsSkeleton rows={4} />
        ) : invoiceQuery.isError || !invoice || !totals ? (
          <DoctorListErrorState
            title={loadErrorToast?.title ?? "تعذّر تحميل الفاتورة"}
            brief={loadErrorToast?.message ?? "تعذّر تحميل بيانات الفاتورة."}
            retrying={retryingInvoice}
            onRetry={() => void retryInvoice()}
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
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    الإجمالي
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#111827]">
                    {formatBillingAmount(totals.total, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    المدفوع
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-primary">
                    {formatBillingAmount(invoice.paid, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    المتبقي
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#DC2626]">
                    {formatBillingAmount(totals.remaining, currency)}
                  </p>
                </div>
              </div>
              {!canAcceptPayment ? (
                <p className="mt-4 rounded-[10px] bg-[#FEF2F2] px-4 py-3 text-center font-cairo text-[13px] font-bold text-[#DC2626]">
                  هذه الفاتورة مسدّدة بالكامل — لا يمكن تسجيل دفعة جديدة عليها.
                </p>
              ) : null}
            </section>

            <div className="space-y-5">
              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  المبلغ
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!canAcceptPayment}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
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
                        disabled={!canAcceptPayment}
                        onClick={() => setMethod(option)}
                        className={cn(
                          "rounded-[12px] border px-4 py-5 text-center transition disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-primary bg-[#F0FDFA] text-primary"
                            : "border-[#EEF2F6] bg-white text-[#667085]",
                        )}
                      >
                        <CreditCard
                          className="mx-auto mb-2 h-5 w-5"
                          aria-hidden
                        />
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
                  التاريخ (اختياري)
                </label>
                <p className="mb-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  اتركه فارغاً أو اختر اليوم لاستخدام وقت التسجيل الحالي. للأيام السابقة اختر
                  التاريخ المناسب — التواريخ المستقبلية غير متاحة.
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
                  disabled={!canAcceptPayment}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
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
                  disabled={!canAcceptPayment}
                  placeholder="وصف ملاحظات..."
                  className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
                />
              </section>

              <button
                type="button"
                disabled={createPayment.isPending || !canAcceptPayment}
                onClick={() => void handleSave()}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden />
                {createPayment.isPending ? "جاري الحفظ..." : "حفظ الدفعة"}
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
