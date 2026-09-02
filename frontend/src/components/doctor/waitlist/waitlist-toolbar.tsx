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
  const { t } = useI18n();
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
              aria-label={t("doctor.waitlist.urgencyFilterAria")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            >
              <option value="">{t("doctor.waitlist.allUrgencies")}</option>
              <option value="low">{waitlistUrgencyLabel("low", t)}</option>
              <option value="medium">{waitlistUrgencyLabel("medium", t)}</option>
              <option value="high">{waitlistUrgencyLabel("high", t)}</option>
            </select>
          ) : null}
          {onDateFromChange ? (
            <input
              type="date"
              value={dateFrom ?? ""}
              onChange={(event) => onDateFromChange(event.target.value)}
              aria-label={t("doctor.patientsFiltersSection.fromDate")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            />
          ) : null}
          {onDateToChange ? (
            <input
              type="date"
              value={dateTo ?? ""}
              onChange={(event) => onDateToChange(event.target.value)}
              aria-label={t("doctor.patientsFiltersSection.toDate")}
              className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[160px]"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
