"use client";

import { Search } from "lucide-react";
import type { ActivityLogPeriod } from "@/lib/doctor/activityLog/types";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

const PERIOD_OPTIONS_CONFIG = [
  { id: "all" as const },
  { id: "today" as const },
  { id: "week" as const },
  { id: "month" as const },
];

export function ActivityLogFilters({
  search,
  onSearchChange,
  period,
  onPeriodChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  period: ActivityLogPeriod;
  onPeriodChange: (value: ActivityLogPeriod) => void;
}) {
  const { dir, t } = useI18n();

  const periodOptions = PERIOD_OPTIONS_CONFIG.map((option) => ({
    ...option,
    label: t(`doctor.activityLog.period.${option.id}`),
  }));

  return (
    <div
      dir={dir}
      className="mb-5 flex w-full flex-col gap-3 lg:flex-row lg:items-stretch"
    >
      <div className="relative min-w-0 flex-[1.35] lg:min-w-[240px]">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("doctor.activityLog.searchPlaceholder")}
          className="h-[46px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-11 pe-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none transition focus:border-primary"
        />
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
        {periodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPeriodChange(option.id)}
            className={cn(
              "min-h-[46px] rounded-[10px] px-3 py-2.5 font-cairo text-[12px] font-extrabold transition",
              period === option.id
                ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]"
                : "border border-[#EEF2F6] bg-white text-[#667085] hover:border-primary/30 hover:text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
