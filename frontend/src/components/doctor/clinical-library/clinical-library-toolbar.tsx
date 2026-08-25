import { DoctorListFilterTabs } from "@/components/doctor/shared/doctor-list-filter-tabs";
import { DoctorListSearchField } from "@/components/doctor/shared/doctor-list-search-field";
import { useI18n } from "@/i18n/provider";
import type { DoctorLibraryItemType } from "@/lib/doctor/library/libraryTypes";
import type { DoctorTemplateType } from "@/lib/doctor/templates/templateTypes";

export type ClinicalLibrarySection = "library" | "templates";
export type ClinicalLibraryTypeFilter = "all" | DoctorLibraryItemType;
export type ClinicalTemplateTypeFilter = "all" | DoctorTemplateType;

const SECTION_CONFIG = [
  { value: "library" as const },
  { value: "templates" as const },
];

const LIBRARY_TYPE_CONFIG = [
  { value: "all" as const },
  { value: "MEDICATION" as const },
  { value: "LAB" as const },
  { value: "IMAGING" as const },
  { value: "PROCEDURE" as const },
];

const TEMPLATE_TYPE_CONFIG = [
  { value: "all" as const },
  { value: "PRESCRIPTION" as const },
  { value: "LAB_ORDER" as const },
  { value: "IMAGING_ORDER" as const },
  { value: "PROCEDURE_ORDER" as const },
  { value: "REFERRAL_ORDER" as const },
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
  const { t } = useI18n();

  const sectionTabs = SECTION_CONFIG.map((tab) => ({
    ...tab,
    label: t(`doctor.clinicalLibrary.section.${tab.value}`),
  }));

  const libraryTypeTabs = LIBRARY_TYPE_CONFIG.map((tab) => ({
    ...tab,
    label: t(`doctor.clinicalLibrary.libraryType.${tab.value}`),
  }));

  const templateTypeTabs = TEMPLATE_TYPE_CONFIG.map((tab) => ({
    ...tab,
    label: t(`doctor.clinicalLibrary.templateType.${tab.value}`),
  }));

  return (
    <div className="space-y-4">
      <DoctorListSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={
          section === "library"
            ? t("doctor.clinicalLibrary.searchLibraryPlaceholder")
            : t("doctor.clinicalLibrary.searchTemplatesPlaceholder")
        }
        ariaLabel={t("doctor.clinicalLibrary.searchLabel")}
        onClear={onClear}
      />

      <DoctorListFilterTabs
        tabs={sectionTabs}
        value={section}
        onChange={onSectionChange}
        columns={2}
      />

      {section === "library" ? (
        <DoctorListFilterTabs
          tabs={libraryTypeTabs}
          value={libraryTypeFilter}
          onChange={onLibraryTypeFilterChange}
          columns={5}
        />
      ) : (
        <DoctorListFilterTabs
          tabs={templateTypeTabs}
          value={templateTypeFilter}
          onChange={onTemplateTypeFilterChange}
          columns={3}
        />
      )}
    </div>
  );
}
