"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { formatBillingNumber } from "@/lib/doctor/billing/format";

export function ClinicAccountsSearchRow({
  value,
  onChange,
  placeholder,
  trailing,
  onValueChangeExtra,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  trailing?: ReactNode;
  onValueChangeExtra?: () => void;
  onClear?: () => void;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

  return (
    <div
      dir={dir}
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative min-w-0 flex-1">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onValueChangeExtra?.();
          }}
          placeholder={placeholder}
          className="h-[46px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-11 pe-4 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary"
        />
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute start-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={tr("مسح البحث", "Clear search")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
        )}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export function ClinicAccountsSearchCount({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return (
    <p className="whitespace-nowrap font-cairo text-[12px] font-bold text-[#667085] tabular-nums">
      {formatBillingNumber(count, { maximumFractionDigits: 0 })} {label}
    </p>
  );
}
