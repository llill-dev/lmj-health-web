import { DoctorListFilterTabs, type DoctorListFilterTab } from './doctor-list-filter-tabs';
import { DoctorListSearchField } from './doctor-list-search-field';

export function DoctorListToolbar<T extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  onClear,
  filterTabs,
  filterValue,
  onFilterChange,
  filterColumns,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  onClear?: () => void;
  filterTabs?: DoctorListFilterTab<T>[];
  filterValue?: T;
  onFilterChange?: (value: T) => void;
  filterColumns?: 2 | 3 | 4 | 5;
}) {
  return (
    <div className="space-y-4">
      <DoctorListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
        onClear={onClear}
      />

      {filterTabs && filterValue != null && onFilterChange ? (
        <DoctorListFilterTabs
          tabs={filterTabs}
          value={filterValue}
          onChange={onFilterChange}
          columns={filterColumns}
        />
      ) : null}
    </div>
  );
}
