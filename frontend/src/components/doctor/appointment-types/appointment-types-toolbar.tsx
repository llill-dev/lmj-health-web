import { DoctorListFilterTabs } from '@/components/doctor/shared/doctor-list-filter-tabs';
import { DoctorListSearchField } from '@/components/doctor/shared/doctor-list-search-field';

export type AppointmentTypeStatusFilter = 'all' | 'active' | 'inactive';

const STATUS_FILTER_TABS: Array<{
  value: AppointmentTypeStatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
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
  return (
    <div className="space-y-4">
      <DoctorListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder="ابحث عن نوع موعد..."
        ariaLabel="بحث في أنواع المواعيد"
        onClear={onClear}
      />
      <DoctorListFilterTabs
        tabs={STATUS_FILTER_TABS}
        value={statusFilter}
        onChange={onStatusFilterChange}
        columns={3}
      />
    </div>
  );
}
