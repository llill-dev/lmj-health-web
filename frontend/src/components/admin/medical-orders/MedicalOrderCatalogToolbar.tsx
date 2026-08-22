import { Search, SlidersHorizontal } from "lucide-react";
import StyledSelect from "@/components/ui/styled-select";

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
  return (
    <div className="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-6">
      <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
        <Search
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث في القائمة…"
          className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white py-2 pe-10 ps-4 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          aria-label="بحث في كتالوج الطلبات"
        />
      </div>
      <div className="relative">
        <SlidersHorizontal
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
        <input
          type="text"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          placeholder="الفئة (category)"
          className="h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white py-2 pe-10 ps-4 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="فلتر الفئة"
        />
      </div>
      <StyledSelect
        value={priorityLevel}
        onChange={onPriorityLevelChange}
        options={[
          { value: "", label: "كل مستويات الأولوية" },
          { value: "critical", label: "حرج" },
          { value: "high", label: "مرتفع" },
          { value: "normal", label: "عادي" },
          { value: "low", label: "منخفض" },
        ]}
        listboxAriaLabel="فلتر مستوى الأولوية"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={visibility}
        onChange={(value) => onVisibilityChange(value as "" | "visible" | "hidden")}
        options={[
          { value: "", label: "الكل" },
          { value: "visible", label: "ظاهر للأطباء" },
          { value: "hidden", label: "مخفي عن الأطباء" },
        ]}
        listboxAriaLabel="فلتر الظهور للأطباء"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={activeStatus}
        onChange={(value) =>
          onActiveStatusChange(value as "" | "active" | "inactive")
        }
        options={[
          { value: "", label: "كل الحالات" },
          { value: "active", label: "نشط فقط" },
          { value: "inactive", label: "غير نشط فقط" },
        ]}
        listboxAriaLabel="فلتر حالة التفعيل"
        triggerClassName="h-[44px] rounded-[12px]"
      />
      <StyledSelect
        value={sort}
        onChange={onSortChange}
        options={[
          { value: "", label: "بلا ترتيب محدّد" },
          { value: "nameEn", label: "الاسم (إنجليزي)" },
          { value: "nameAr", label: "الاسم (عربي)" },
          { value: "category", label: "الفئة" },
          { value: "createdAt", label: "تاريخ الإنشاء" },
          { value: "updatedAt", label: "آخر تحديث" },
        ]}
        listboxAriaLabel="ترتيب الكتالوج"
        triggerClassName="h-[44px] rounded-[12px]"
      />
    </div>
  );
}
