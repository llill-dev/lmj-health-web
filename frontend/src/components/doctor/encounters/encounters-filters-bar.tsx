import { Search } from "lucide-react";
import StyledSelect from "@/components/ui/styled-select";
import type { EncountersFiltersState } from "./types";
import { useI18n } from "@/i18n/provider";

const SORT_OPTIONS_CONFIG = [
  { value: "startedAt-desc" as const },
  { value: "startedAt-asc" as const },
  { value: "createdAt-desc" as const },
  { value: "createdAt-asc" as const },
];

type EncountersFiltersBarProps = {
  filters: EncountersFiltersState;
  onChange: (patch: Partial<EncountersFiltersState>) => void;
};

export function EncountersFiltersBar({
  filters,
  onChange,
}: EncountersFiltersBarProps) {
  const { t } = useI18n();

  const sortOptions = SORT_OPTIONS_CONFIG.map((option) => ({
    ...option,
    label: t(`doctor.encounters.sort.${option.value}`),
  }));

  const sortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <section
      aria-label={t("doctor.encounters.filterLabel")}
      className="mb-4 space-y-3 rounded-[14px] border border-[#E2E8F0] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-5"
    >
      <label className="relative block">
        <span className="sr-only">{t("doctor.encounters.searchLabel")}</span>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder={t("doctor.encounters.searchPlaceholder")}
          className="h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] pe-3 ps-10 font-cairo text-[13px] font-semibold text-[#101828] placeholder:text-[#98A2B3] outline-none transition-shadow focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-start">
          <span className="mb-1.5 block font-cairo text-[12px] font-bold text-[#475467]">
            {t("doctor.encounters.fromDate")}
          </span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none transition-shadow focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="block text-start">
          <span className="mb-1.5 block font-cairo text-[12px] font-bold text-[#475467]">
            {t("doctor.encounters.toDate")}
          </span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-cairo text-[13px] font-semibold text-[#101828] outline-none transition-shadow focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <div className="text-start">
          <span className="mb-1.5 block font-cairo text-[12px] font-bold text-[#475467]">
            {t("doctor.encounters.sortLabel")}
          </span>
          <StyledSelect
            value={sortValue}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [
                EncountersFiltersState["sortBy"],
                EncountersFiltersState["sortOrder"],
              ];
              onChange({ sortBy, sortOrder });
            }}
            options={sortOptions}
            placeholder={t("doctor.encounters.sortPlaceholder")}
          />
        </div>
      </div>
    </section>
  );
}
