import { DoctorListToolbar } from '@/components/doctor/shared/doctor-list-toolbar';
import { buildWaitlistStatusTabs } from '@/lib/doctor/waitlist/labels';
import type { WaitlistStatus } from '@/lib/doctor/waitlist/types';
import { useI18n } from '@/i18n/provider';

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
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  return (
    <DoctorListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={tr('ابحث بالاسم أو الرقم العام...', 'Search by name or public ID...')}
      searchAriaLabel={tr('بحث في قائمة الانتظار', 'Search the waitlist')}
      onClear={onClear}
      filterTabs={buildWaitlistStatusTabs(tr)}
      filterValue={statusTab}
      onFilterChange={onStatusTabChange}
      filterColumns={5}
    />
  );
}
