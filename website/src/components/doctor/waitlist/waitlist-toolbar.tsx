import { DoctorListToolbar } from '@/components/doctor/shared/doctor-list-toolbar';
import { WAITLIST_STATUS_TABS } from '@/lib/doctor/waitlist/labels';
import type { WaitlistStatus } from '@/lib/doctor/waitlist/types';

export function WaitlistToolbar({
  search,
  onSearchChange,
  onClear,
  statusTab,
  onStatusTabChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
  statusTab: 'all' | WaitlistStatus;
  onStatusTabChange: (value: 'all' | WaitlistStatus) => void;
}) {
  return (
    <DoctorListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="ابحث بالاسم أو الرقم العام..."
      searchAriaLabel="بحث في قائمة الانتظار"
      onClear={onClear}
      filterTabs={WAITLIST_STATUS_TABS}
      filterValue={statusTab}
      onFilterChange={onStatusTabChange}
      filterColumns={5}
    />
  );
}
