import { Search, SlidersHorizontal } from "lucide-react";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  priorityLevel: string;
  onPriorityLevelChange: (value: string) => void;
  visibility: "" | "visible" | "hidden";
  onVisibilityChange: (value: "" | "visible" | "hidden") => void;
  activeStatus: "" | "active" | "inactive";
  onActiveStatusChange: (value: "" | "active" | "inactive") => void;
  sort: string;
  onSortChange: (value: string) => void;
};

/** حقل بحث + فلاتر الظهور/الحالة/الفرز — زر «إضافة» يُعرض بجانب العنوان في الصفحة. */
export default function MedicalOrderCatalogToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  priorityLevel,
  onPriorityLevelChange,
  visibility,
  onVisibilityChange,
  activeStatus,
  onActiveStatusChange,
  sort,
  onSortChange,
}: Props) {
  const { t } = useI18n();
  return (
    <div className="grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      <div className="relative min-w-0 sm:col-span-2">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("adminMedicalOrders.toolbar.search.placeholder")}
          className="h-[44px] w-full min-w-0 rounded-[12px] border border-[#E5E7EB] bg-white py-2 ps-10 pe-4 text-start font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          aria-label={t("adminMedicalOrders.toolbar.search.ariaLabel")}
        />
      </div>
      <div className="relative min-w-0">
        <SlidersHorizontal
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
        <input
          type="text"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          placeholder={t("adminMedicalOrders.toolbar.category.placeholder")}
          className="h-[44px] w-full min-w-0 rounded-[12px] border border-[#E5E7EB] bg-white py-2 ps-10 pe-4 text-start font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label={t("adminMedicalOrders.toolbar.category.ariaLabel")}
        />
      </div>
      <StyledSelect
        value={priorityLevel}
        onChange={onPriorityLevelChange}
        options={[
          { value: "", label: t("adminMedicalOrders.toolbar.priority.allLevels") },
          { value: "critical", label: t("adminMedicalOrders.priority.critical") },
          { value: "high", label: t("adminMedicalOrders.priority.high") },
          { value: "normal", label: t("adminMedicalOrders.priority.normal") },
          { value: "low", label: t("adminMedicalOrders.priority.low") },
        ]}
        listboxAriaLabel={t("adminMedicalOrders.toolbar.priority.ariaLabel")}
        className="min-w-0"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={visibility}
        onChange={(value) => onVisibilityChange(value as "" | "visible" | "hidden")}
        options={[
          { value: "", label: t("common.all") },
          { value: "visible", label: t("adminMedicalOrders.toolbar.visibility.visible") },
          { value: "hidden", label: t("adminMedicalOrders.toolbar.visibility.hidden") },
        ]}
        listboxAriaLabel={t("adminMedicalOrders.toolbar.visibility.ariaLabel")}
        className="min-w-0"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={activeStatus}
        onChange={(value) =>
          onActiveStatusChange(value as "" | "active" | "inactive")
        }
        options={[
          { value: "", label: t("adminMedicalOrders.toolbar.active.allStatuses") },
          { value: "active", label: t("adminMedicalOrders.toolbar.active.activeOnly") },
          { value: "inactive", label: t("adminMedicalOrders.toolbar.active.inactiveOnly") },
        ]}
        listboxAriaLabel={t("adminMedicalOrders.toolbar.active.ariaLabel")}
        className="min-w-0"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={sort}
        onChange={onSortChange}
        options={[
          { value: "", label: t("adminMedicalOrders.toolbar.sort.none") },
          { value: "nameEn", label: t("adminMedicalOrders.toolbar.sort.nameEn") },
          { value: "nameAr", label: t("adminMedicalOrders.toolbar.sort.nameAr") },
          { value: "category", label: t("adminMedicalOrders.toolbar.sort.category") },
          { value: "createdAt", label: t("adminMedicalOrders.toolbar.sort.createdAt") },
          { value: "updatedAt", label: t("adminMedicalOrders.toolbar.sort.updatedAt") },
        ]}
        listboxAriaLabel={t("adminMedicalOrders.toolbar.sort.ariaLabel")}
        className="min-w-0"
        triggerClassName="h-[44px] rounded-[12px]"
      />
    </div>
  );
}
