"use client";

import { FileText, Pencil, Plus, Receipt, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ClinicInvoice } from "@/lib/doctor/clinicAccounts/types";
import { formatBillingAmount, formatUsd } from "@/lib/doctor/billing/format";
import { calcInvoiceTotals } from "@/lib/doctor/clinicAccounts/invoiceTotals";
import { ClinicAccountsModalShell } from "@/components/doctor/clinic-accounts/clinic-accounts-modal-shell";
import { InvoiceEditDialog } from "@/components/doctor/clinic-accounts/invoice-edit-dialog";
import { InvoiceRefundDialog } from "@/components/doctor/clinic-accounts/invoice-refund-dialog";
import { InvoiceStatusBadge } from "@/components/doctor/clinic-accounts/invoice-status-badge";
import { useToast } from "@/components/ui/ToastProvider";
import { useCancelBillingInvoice, useIssueBillingInvoice } from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils/utils";

function hasRefundablePayments(invoice: ClinicInvoice): boolean {
  return invoice.payments.some((payment) => {
    const refundable =
      payment.refundableAmount ??
      Math.max(0, payment.amount - (payment.refundedAmount ?? 0));
    return refundable > 0 && Boolean(payment.rawId);
  });
}

export function InvoiceDetailsDialog({
  open,
  invoice,
  onClose,
  onInvoiceUpdated,
}: {
  open: boolean;
  invoice: ClinicInvoice | null;
  onClose: () => void;
  onInvoiceUpdated?: () => void;
}) {
  const { toast } = useToast();
  const cancelInvoice = useCancelBillingInvoice();
  const issueInvoice = useIssueBillingInvoice();
  const [editOpen, setEditOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [issueBusy, setIssueBusy] = useState(false);

  const canEdit = invoice?.apiStatus === "draft";
  const canIssue = Boolean(invoice?.rawId && invoice.apiStatus === "draft");
  const canCancel =
    invoice?.rawId &&
    invoice.apiStatus !== "cancelled" &&
    invoice.apiStatus !== "paid";
  const canRefund = useMemo(
    () => (invoice ? hasRefundablePayments(invoice) : false),
    [invoice],
  );

  if (!invoice) return null;

  const { subtotal, discount, tax, total, remaining } =
    calcInvoiceTotals(invoice);

  const handleEditClick = () => {
    if (!canEdit) {
      toast("يمكن تعديل المسودات فقط. الفاتورة الصادرة أو المدفوعة لا تُعدَّل.", {
        title: "لا يمكن التعديل",
        variant: "error",
      });
      return;
    }
    setEditOpen(true);
  };

  const handleRefundClick = () => {
    if (!canRefund) {
      toast("لا توجد دفعات بمبلغ قابل للاسترداد على هذه الفاتورة.", {
        title: "لا يمكن الاسترجاع",
        variant: "error",
      });
      return;
    }
    setRefundOpen(true);
  };

  const refreshInvoice = () => {
    onInvoiceUpdated?.();
  };

  const handleIssueClick = async () => {
    if (!invoice?.rawId || !canIssue) {
      toast('يمكن إصدار المسودات فقط.', {
        title: 'لا يمكن الإصدار',
        variant: 'error',
      });
      return;
    }
    setIssueBusy(true);
    try {
      await issueInvoice.mutateAsync({ invoiceId: invoice.rawId });
      toast('تم إصدار الفاتورة.', { variant: 'success' });
      refreshInvoice();
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إصدار الفاتورة',
        variant: 'error',
      });
    } finally {
      setIssueBusy(false);
    }
  };

  const handleCancelClick = async () => {
    if (!invoice?.rawId) return;
    if (!canCancel) {
      toast("لا يمكن إلغاء هذه الفاتورة في حالتها الحالية.", {
        title: "لا يمكن الإلغاء",
        variant: "error",
      });
      return;
    }
    const reason = window.prompt("سبب الإلغاء (اختياري):") ?? undefined;
    setCancelBusy(true);
    try {
      await cancelInvoice.mutateAsync({
        invoiceId: invoice.rawId,
        reason: reason?.trim() || undefined,
      });
      toast("تم إلغاء الفاتورة.", { variant: "success" });
      refreshInvoice();
      onClose();
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إلغاء الفاتورة',
        variant: 'error',
      });
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <>
      <ClinicAccountsModalShell
        open={open}
        onClose={onClose}
        title="تفاصيل الفاتورة"
        headerPattern
        maxWidthClass="max-w-[760px]"
      >
        <div dir="rtl" lang="ar" className="space-y-5">
          <div className="rounded-[12px] border border-[#EEF2F6] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 text-start">
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
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="mt-3 text-start font-cairo text-[12px] font-semibold text-[#98A2B3]">
              تاريخ الاستحقاق: {invoice.dueDate}
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F0FDFA] p-5">
            <h3 className="mb-4 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
              الملخص المالي
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "الإجمالي",
                  value: formatUsd(total),
                  tone: "text-[#111827]",
                },
                {
                  label: "المدفوع",
                  value: formatUsd(invoice.paid),
                  tone: "text-primary",
                },
                {
                  label: "المتبقي",
                  value: formatUsd(remaining),
                  tone: "text-[#F97316]",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[10px] border border-[#EEF2F6] bg-white px-3 py-4 text-center"
                >
                  <p className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                    {item.label}
                  </p>
                  <p
                    className={`mt-2 font-cairo text-[18px] font-black ${item.tone}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#EEF2F6] p-5">
            <h3 className="mb-4 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
              البنود
            </h3>
            <div className="space-y-3">
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 text-start">
                    <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {item.name}
                    </p>
                    <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      الكمية: {item.quantity}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="font-cairo text-[14px] font-extrabold text-primary tabular-nums">
                      {formatUsd(item.quantity * item.unitPrice)}
                    </p>
                    <p className="font-cairo text-[11px] font-semibold text-[#98A2B3] tabular-nums">
                      {formatUsd(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-[#EEF2F6] pt-4 text-start">
              <p className="font-cairo text-[12px] font-semibold text-[#667085] tabular-nums">
                المجموع الفرعي: {formatUsd(subtotal)}
              </p>
              {discount > 0 ? (
                <p className="font-cairo text-[12px] font-semibold text-[#F97316] tabular-nums">
                  الخصم {invoice.discountPercent}%: -{formatUsd(discount)}
                </p>
              ) : null}
              <p className="font-cairo text-[12px] font-semibold text-[#667085] tabular-nums">
                الضريبة {invoice.taxPercent}%: {formatUsd(tax)}
              </p>
              <p className="font-cairo text-[18px] font-black text-primary tabular-nums">
                الإجمالي: {formatUsd(total)}
              </p>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#EEF2F6] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-cairo text-[14px] font-extrabold text-[#111827]">
                الدفعات
              </h3>
              <Link
                to={`/doctor/accounts/payments/new?invoice=${encodeURIComponent(invoice.rawId ?? invoice.id)}`}
                onClick={onClose}
                className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة دفعة
              </Link>
            </div>
            {invoice.payments.length ? (
              <div className="space-y-2">
                {invoice.payments.map((payment) => {
                  const refundable =
                    payment.refundableAmount ??
                    Math.max(
                      0,
                      payment.amount - (payment.refundedAmount ?? 0),
                    );
                  return (
                    <div
                      key={payment.rawId ?? payment.id}
                      className="flex items-center justify-between rounded-[10px] bg-[#F0FDFA] px-4 py-3"
                    >
                      <div className="min-w-0 text-start">
                        <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                          {payment.id}
                        </p>
                        <p className="font-cairo text-[11px] font-semibold text-[#667085]">
                          {payment.method} • {payment.date}
                        </p>
                        {refundable > 0 ? (
                          <p className="font-cairo text-[11px] font-semibold text-primary tabular-nums">
                            قابل للاسترداد:{" "}
                            {formatBillingAmount(
                              refundable,
                              invoice.currency ?? "USD",
                            )}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-cairo text-[15px] font-black text-primary tabular-nums">
                        {formatUsd(payment.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center font-cairo text-[13px] font-semibold text-[#98A2B3]">
                لا توجد دفعات بعد
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {canIssue ? (
              <button
                type="button"
                onClick={() => void handleIssueClick()}
                disabled={issueBusy}
                className="col-span-2 inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden />
                {issueBusy ? 'جارٍ الإصدار...' : 'إصدار الفاتورة'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleEditClick}
              className={cn(
                "inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FDFA]",
                !canEdit && "opacity-60",
              )}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              تعديل
            </button>
            <button
              type="button"
              onClick={handleRefundClick}
              className={cn(
                "inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white transition hover:bg-primary/90",
                !canRefund && "opacity-60",
              )}
            >
              <Receipt className="w-4 h-4" aria-hidden />
              استرجاع
            </button>
            <button
              type="button"
              onClick={() => void handleCancelClick()}
              disabled={cancelBusy || !canCancel}
              className={cn(
                "col-span-2 inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] font-cairo text-[14px] font-extrabold text-[#B42318] transition hover:bg-[#FEE4E2] disabled:opacity-60",
              )}
            >
              <XCircle className="h-4 w-4" aria-hidden />
              {cancelBusy ? "جارٍ الإلغاء..." : "إلغاء الفاتورة"}
            </button>
          </div>
          {!canEdit ? (
            <p className="text-center font-cairo text-[11px] font-semibold text-[#98A2B3]">
              التعديل متاح للمسودات فقط
            </p>
          ) : null}
        </div>
      </ClinicAccountsModalShell>

      <InvoiceEditDialog
        open={editOpen}
        invoice={invoice}
        onClose={() => setEditOpen(false)}
        onSuccess={refreshInvoice}
      />

      <InvoiceRefundDialog
        open={refundOpen}
        invoice={invoice}
        onClose={() => setRefundOpen(false)}
        onSuccess={refreshInvoice}
      />
    </>
  );
}

export function RecentActivityList({
  activities,
}: {
  activities: import("@/lib/doctor/clinicAccounts/types").RecentActivity[];
}) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3"
        >
          <div className="flex gap-3 items-center text-right">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDFA] text-primary">
              <FileText className="w-4 h-4" aria-hidden />
            </div>
            <div>
              <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {activity.title}
              </p>
              <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                {activity.timeLabel}
              </p>
            </div>
          </div>
          <span
            className={
              activity.type === "income"
                ? "font-cairo text-[14px] font-black text-primary"
                : "font-cairo text-[14px] font-black text-[#DC2626]"
            }
          >
            {activity.type === "income" ? "+" : "-"}
            {formatBillingAmount(activity.amount, activity.currency ?? "USD")}
          </span>
        </div>
      ))}
    </div>
  );
}
