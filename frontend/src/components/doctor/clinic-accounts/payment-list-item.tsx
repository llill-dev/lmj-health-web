"use client";

import { motion } from "framer-motion";
import type { ApiBillingPayment } from "@/lib/doctor/billing/apiTypes";
import {
  formatBillingAmount,
  formatBillingDate,
} from "@/lib/doctor/billing/format";
import { useI18n } from "@/i18n/provider";

function paymentMethodLabel(
  method: string | undefined,
  t: (key: string) => string,
): string {
  switch (method) {
    case "cash":
      return t("doctor.clinicAccounts.paymentMethod.cash");
    case "card":
      return t("doctor.clinicAccounts.paymentMethod.card");
    case "bank_transfer":
      return t("doctor.clinicAccounts.paymentMethod.bankTransfer");
    case "insurance":
      return t("doctor.clinicAccounts.paymentMethod.insurance");
    default:
      return method || "—";
  }
}

export function PaymentListItem({
  payment,
  index,
  currency,
}: {
  payment: ApiBillingPayment;
  index: number;
  currency?: string;
}) {
  const { t } = useI18n();
  const hasRefund = (payment.refundedAmount ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#D1FAE5] bg-white px-5 py-4 shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-cairo text-[14px] font-extrabold text-[#111827]">
            {payment.number ?? payment.id}
          </span>
          {payment.invoiceNumber ? (
            <span className="inline-flex items-center rounded-full bg-[#F0FDFA] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-primary">
              {t("doctor.clinicAccounts.payment.invoice")}{" "}
              {payment.invoiceNumber}
            </span>
          ) : null}
          {hasRefund ? (
            <span className="inline-flex items-center rounded-full bg-[#FEF3F2] px-2.5 py-0.5 font-cairo text-[11px] font-extrabold text-[#B42318]">
              {t("doctor.clinicAccounts.payment.refunded")}
            </span>
          ) : null}
        </div>
        <p className="font-cairo text-[13px] font-bold text-[#111827]">
          {payment.patient?.fullName ||
            t("doctor.clinicAccounts.payment.unknownPatient")}
        </p>
        <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
          {paymentMethodLabel(payment.method, t)} ·{" "}
          {formatBillingDate(payment.paidAt)}
        </p>
      </div>
      <span className="font-cairo text-[22px] font-black text-primary">
        {formatBillingAmount(payment.amount ?? 0, currency)}
      </span>
    </motion.div>
  );
}
