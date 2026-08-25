import { DoctorListFilterTabs } from "@/components/doctor/shared/doctor-list-filter-tabs";
import { DoctorListSearchField } from "@/components/doctor/shared/doctor-list-search-field";
import { useI18n } from "@/i18n/provider";

export type AppointmentTypeStatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_CONFIG = [
  { value: "all" as const },
  { value: "active" as const },
  { value: "inactive" as const },
];

export function AppointmentTypesToolbar({
  search,
  onSearchChange,
  onClear,
  statusFilter,
  onStatusFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
  statusFilter: AppointmentTypeStatusFilter;
  onStatusFilterChange: (value: AppointmentTypeStatusFilter) => void;
}) {
  const { t } = useI18n();

  const statusFilterTabs = STATUS_FILTER_CONFIG.map((tab) => ({
    ...tab,
    label: t(`doctor.appointmentTypes.status.${tab.value}`),
  }));

  return (
    <div className="space-y-4">
      <DoctorListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={t("doctor.appointmentTypes.searchPlaceholder")}
        ariaLabel={t("doctor.appointmentTypes.searchLabel")}
        onClear={onClear}
      />
      <DoctorListFilterTabs
        tabs={statusFilterTabs}
        value={statusFilter}
        onChange={onStatusFilterChange}
        columns={3}
      />
    </div>
  );
}
