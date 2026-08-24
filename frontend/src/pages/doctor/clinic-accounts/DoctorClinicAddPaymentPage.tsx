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
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";

function buildMethodLabels(tr: (ar: string, en: string) => string): Record<string, string> {
  return {
    cash: tr("نقدي", "Cash"),
    card: tr("بطاقة", "Card"),
    bank_transfer: tr("تحويل بنكي", "Bank transfer"),
    insurance: tr("تأمين", "Insurance"),
  };
}

import {
  billingOptionalTransactionDateToIso,
  billingTodayDateInput,
  getBillingFutureDateMessage,
  isBillingDateInputAfterToday,
} from "@/lib/doctor/billing/dateInput";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useI18n } from "@/i18n/provider";

export default function DoctorClinicAddPaymentPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const methodLabels = buildMethodLabels(tr);
  const navigate = useNavigate();
  const { basePath, canViewSettings, isSecretary } = useBillingAccess();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const invoiceParam = searchParams.get("invoice") ?? "";

  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
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

  // Don't silently offer all payment methods when settings failed to load —
  // the backend may reject a method that's actually disabled in clinic settings.
  const methodsUnavailable =
    settingsQuery.isError || !settingsQuery.settings?.allowedPaymentMethods?.length;
  const methods = settingsQuery.settings?.allowedPaymentMethods?.length
    ? settingsQuery.settings.allowedPaymentMethods
    : [];

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
      toast(tr("معرّف الفاتورة غير صالح.", "The invoice ID is invalid."), {
        title: tr("خطأ", "Error"),
        variant: "error",
      });
      return;
    }

    if (!canAcceptPayment) {
      toast(tr("لا يوجد مبلغ متبقٍ على هذه الفاتورة.", "There is no remaining amount on this invoice."), {
        title: tr("لا يمكن إضافة دفعة", "Cannot add a payment"),
        variant: "error",
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast(tr("أدخل مبلغ دفعة صالحاً.", "Enter a valid payment amount."), {
        title: tr("مبلغ غير صالح", "Invalid amount"),
        variant: "error",
      });
      return;
    }

    if (totals && parsedAmount > totals.remaining) {
      toast(
        tr(
          `المبلغ يتجاوز المتبقي (${formatBillingAmount(totals.remaining, currency)}).`,
          `The amount exceeds the remaining balance (${formatBillingAmount(totals.remaining, currency)}).`,
        ),
        {
          title: tr("مبلغ غير صالح", "Invalid amount"),
          variant: "error",
        },
      );
      return;
    }

    if (isBillingDateInputAfterToday(date)) {
      const futureDateMessage = getBillingFutureDateMessage(tr);
      toast(futureDateMessage.message, {
        title: futureDateMessage.title,
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

      toast(tr("تم حفظ الدفعة بنجاح.", "The payment was saved successfully."), {
        title: tr("تم الحفظ", "Saved"),
        variant: "success",
      });
      navigate(`${basePath}/invoices`);
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
        <title>
          {tr("إضافة دفعة • LMJ Health", "Add Payment • LMJ Health")}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ClinicAccountsBanner
          title={tr("إضافة دفعة", "Add payment")}
          subtitle={tr(
            "تسجيل دفعة جديدة على الفاتورة",
            "Record a new payment on the invoice",
          )}
          icon={<CreditCard className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        {!invoiceParam ? (
          <DoctorListErrorState
            title={tr("فاتورة غير محددة", "Invoice not specified")}
            brief={tr(
              "افتح هذه الصفحة من تفاصيل فاتورة (زر «إضافة دفعة») أو من قائمة الفواتير.",
              'Open this page from an invoice\'s details (the "Add payment" button) or from the invoices list.',
            )}
            onRetry={() => navigate(`${basePath}/invoices`)}
          />
        ) : invoiceQuery.isAwaitingData ? (
          <DoctorInlineDetailsSkeleton rows={4} />
        ) : invoiceQuery.isError || !invoice || !totals ? (
          <DoctorListErrorState
            title={
              loadErrorToast?.title ??
              tr("تعذّر تحميل الفاتورة", "Failed to load invoice")
            }
            brief={loadErrorToast?.message ?? tr("تعذّر تحميل بيانات الفاتورة.", "Failed to load the invoice data.")}
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
                    {tr("الإجمالي", "Total")}
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#111827]">
                    {formatBillingAmount(totals.total, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {tr("المدفوع", "Paid")}
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-primary">
                    {formatBillingAmount(invoice.paid, currency)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-4 text-center">
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {tr("المتبقي", "Remaining")}
                  </p>
                  <p className="mt-2 font-cairo text-[18px] font-black text-[#DC2626]">
                    {formatBillingAmount(totals.remaining, currency)}
                  </p>
                </div>
              </div>
              {!canAcceptPayment ? (
                <p className="mt-4 rounded-[10px] bg-[#FEF2F2] px-4 py-3 text-center font-cairo text-[13px] font-bold text-[#DC2626]">
                  {tr(
                    "هذه الفاتورة مسدّدة بالكامل — لا يمكن تسجيل دفعة جديدة عليها.",
                    "This invoice is fully paid — no new payment can be recorded on it.",
                  )}
                </p>
              ) : null}
            </section>

            <div className="space-y-5">
              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  {tr("المبلغ", "Amount")}
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
                  {tr("طريقة الدفع", "Payment method")}
                </h2>
                {methodsUnavailable ? (
                  <p className="rounded-[10px] border border-dashed border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-right font-cairo text-[12px] font-semibold text-[#B42318]">
                    {tr(
                      "تعذّر تحميل طرق الدفع المفعّلة لهذه العيادة. لا يمكن تسجيل دفعة قبل توفّر هذه البيانات.",
                      "Could not load the enabled payment methods for this clinic. A payment cannot be recorded until this data is available.",
                    )}
                  </p>
                ) : (
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
                          {methodLabels[option] ?? option}
                        </span>
                      </button>
                    );
                  })}
                </div>
                )}
              </section>

              <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
                <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
                  {tr("التاريخ (اختياري)", "Date (optional)")}
                </label>
                <p className="mb-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  {tr(
                    "اتركه فارغاً أو اختر اليوم لاستخدام وقت التسجيل الحالي. للأيام السابقة اختر التاريخ المناسب — التواريخ المستقبلية غير متاحة.",
                    "Leave it empty or select today to use the current recording time. For previous days, pick the appropriate date — future dates are not available.",
                  )}
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
                  {tr("ملاحظات", "Notes")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  disabled={!canAcceptPayment}
                  placeholder={tr("وصف ملاحظات...", "Describe any notes...")}
                  className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
                />
              </section>

              <button
                type="button"
                disabled={createPayment.isPending || !canAcceptPayment || methodsUnavailable}
                onClick={() => void handleSave()}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden />
                {createPayment.isPending ? tr("جاري الحفظ...", "Saving...") : tr("حفظ الدفعة", "Save payment")}
              </button>

              <Link
                to={`${basePath}/invoices`}
                className="inline-block font-cairo text-[13px] font-extrabold text-[#667085]"
              >
                {tr("الرجوع إلى الفواتير ←", "Back to invoices ←")}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
