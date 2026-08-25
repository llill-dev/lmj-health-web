import { DoctorListToolbar } from "@/components/doctor/shared/doctor-list-toolbar";
import { buildWaitlistStatusTabs, waitlistUrgencyLabel } from "@/lib/doctor/waitlist/labels";
import type { WaitlistStatus, WaitlistUrgency } from "@/lib/doctor/waitlist/types";
import { useI18n } from "@/i18n/provider";

export function WaitlistToolbar({
  search,
  onSearchChange,
  onClear,
  statusTab,
  onStatusTabChange,
  urgency,
  onUrgencyChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
  statusTab: "all" | WaitlistStatus;
  onStatusTabChange: (value: "all" | WaitlistStatus) => void;
  /** Optional — omit to keep the toolbar without urgency/date-range controls (e.g. the doctor waitlist page). */
  urgency?: "" | WaitlistUrgency;
  onUrgencyChange?: (value: "" | WaitlistUrgency) => void;
  dateFrom?: string;
  onDateFromChange?: (value: string) => void;
  dateTo?: string;
  onDateToChange?: (value: string) => void;
}) {
  const { t, locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const showExtraFilters = Boolean(onUrgencyChange || onDateFromChange || onDateToChange);

  return (
    <div className="space-y-4">
      <DoctorListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={t("doctor.waitlist.searchPlaceholder")}
        searchAriaLabel={t("doctor.waitlist.search")}
        onClear={onClear}
        filterTabs={buildWaitlistStatusTabs(t)}
        filterValue={statusTab}
        onFilterChange={onStatusTabChange}
        filterColumns={5}
      />

      {showExtraFilters ? (
        <div className="flex flex-wrap items-center gap-3">
          {onUrgencyChange ? (
            <select
              value={urgency ?? ""}
              onChange={(event) =>
                onUrgencyChange(event.target.value as "" | WaitlistUrgency)
              }
              aria-label={tr("الأولوية", "Urgency")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            >
              <option value="">{tr("كل الأولويات", "All urgencies")}</option>
              <option value="low">{waitlistUrgencyLabel("low", tr)}</option>
              <option value="medium">{waitlistUrgencyLabel("medium", tr)}</option>
              <option value="high">{waitlistUrgencyLabel("high", tr)}</option>
            </select>
          ) : null}
          {onDateFromChange ? (
            <input
              type="date"
              value={dateFrom ?? ""}
              onChange={(event) => onDateFromChange(event.target.value)}
              aria-label={tr("من تاريخ", "From date")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            />
          ) : null}
          {onDateToChange ? (
            <input
              type="date"
              value={dateTo ?? ""}
              onChange={(event) => onDateToChange(event.target.value)}
              aria-label={tr("إلى تاريخ", "To date")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
