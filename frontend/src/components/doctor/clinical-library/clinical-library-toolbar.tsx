import { DoctorListFilterTabs } from '@/components/doctor/shared/doctor-list-filter-tabs';
import { DoctorListSearchField } from '@/components/doctor/shared/doctor-list-search-field';
import type { DoctorLibraryItemType } from '@/lib/doctor/library/libraryTypes';
import type { DoctorTemplateType } from '@/lib/doctor/templates/templateTypes';

export type ClinicalLibrarySection = 'library' | 'templates';
export type ClinicalLibraryTypeFilter = 'all' | DoctorLibraryItemType;
export type ClinicalTemplateTypeFilter = 'all' | DoctorTemplateType;

const SECTION_TABS: Array<{ value: ClinicalLibrarySection; label: string }> = [
  { value: 'library', label: 'المكتبة السريرية' },
  { value: 'templates', label: 'القوالب' },
];

const LIBRARY_TYPE_TABS: Array<{
  value: ClinicalLibraryTypeFilter;
  label: string;
}> = [
  { value: 'all', label: 'الكل' },
  { value: 'MEDICATION', label: 'أدوية' },
  { value: 'LAB', label: 'تحاليل' },
  { value: 'IMAGING', label: 'أشعة' },
  { value: 'PROCEDURE', label: 'إجراءات' },
];

const TEMPLATE_TYPE_TABS: Array<{
  value: ClinicalTemplateTypeFilter;
  label: string;
}> = [
  { value: 'all', label: 'الكل' },
  { value: 'PRESCRIPTION', label: 'وصفة' },
  { value: 'LAB_ORDER', label: 'طلب مخبري' },
  { value: 'IMAGING_ORDER', label: 'طلب أشعة' },
  { value: 'PROCEDURE_ORDER', label: 'طلب إجراء' },
  { value: 'REFERRAL_ORDER', label: 'إحالة' },
];

export function ClinicalLibraryToolbar({
  search,
  onSearchChange,
  onClear,
  section,
  onSectionChange,
  libraryTypeFilter,
  onLibraryTypeFilterChange,
  templateTypeFilter,
  onTemplateTypeFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
  section: ClinicalLibrarySection;
  onSectionChange: (value: ClinicalLibrarySection) => void;
  libraryTypeFilter: ClinicalLibraryTypeFilter;
  onLibraryTypeFilterChange: (value: ClinicalLibraryTypeFilter) => void;
  templateTypeFilter: ClinicalTemplateTypeFilter;
  onTemplateTypeFilterChange: (value: ClinicalTemplateTypeFilter) => void;
}) {
  return (
    <div className="space-y-4">
      <DoctorListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={
          section === 'library'
            ? 'ابحث في المكتبة السريرية...'
            : 'ابحث في القوالب...'
        }
        ariaLabel="بحث في المكتبة السريرية"
        onClear={onClear}
      />

      <DoctorListFilterTabs
        tabs={SECTION_TABS}
        value={section}
        onChange={onSectionChange}
        columns={2}
      />

      {section === 'library' ? (
        <DoctorListFilterTabs
          tabs={LIBRARY_TYPE_TABS}
          value={libraryTypeFilter}
          onChange={onLibraryTypeFilterChange}
          columns={5}
        />
      ) : (
        <DoctorListFilterTabs
          tabs={TEMPLATE_TYPE_TABS}
          value={templateTypeFilter}
          onChange={onTemplateTypeFilterChange}
          columns={3}
        />
      )}
    </div>
  );
}
