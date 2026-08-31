import { formatBillingAmount } from "@/lib/doctor/billing/format";
import { useI18n } from "@/i18n/provider";

export function InvoiceSummaryCard({
  subtotal,
  tax,
  total,
  taxPercent,
  currency,
  showTax = true,
}: {
  subtotal: number;
  tax: number;
  total: number;
  taxPercent: number;
  currency: string;
  showTax?: boolean;
}) {
  const { t } = useI18n();

  return (
    <section className="rounded-[10px] border border-primary bg-[#E6F4F1] p-5 sm:p-6">
      <h2 className="mb-4 text-start font-cairo text-[14px] font-semibold text-[#667085]">
        {t("doctor.clinicAccounts.invoiceSummary.title")}
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 font-cairo text-[13px] font-semibold text-[#667085]">
          <span>{t("doctor.clinicAccounts.invoiceSummary.subtotal")}</span>
          <span className="tabular-nums">
            {formatBillingAmount(subtotal, currency)}
          </span>
        </div>
        {showTax ? (
          <div className="flex items-center justify-between gap-4 font-cairo text-[13px] font-semibold text-[#667085]">
            <span>
              {t("doctor.clinicAccounts.invoiceSummary.tax")} ({taxPercent}%)
            </span>
            <span className="tabular-nums">
              {formatBillingAmount(tax, currency)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="my-4 border-t border-primary" aria-hidden />

      <div className="flex items-center justify-between gap-4">
        <span className="font-cairo text-[15px] font-black text-[#111827]">
          {t("doctor.clinicAccounts.invoiceSummary.total")}
        </span>
        <span className="font-cairo text-[15px] font-black text-primary tabular-nums">
          {formatBillingAmount(total, currency)}
        </span>
      </div>
    </section>
  );
}
