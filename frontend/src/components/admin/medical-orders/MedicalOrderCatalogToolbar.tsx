import { Search, Eye, EyeOff } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  showVisibleOnly: boolean;
  onShowVisibleOnlyChange: (value: boolean) => void;
};

/** حقل بحث + فلتر الظهور — زر «إضافة» يُعرض بجانب العنوان في الصفحة. */
export default function MedicalOrderCatalogToolbar({
  search,
  onSearchChange,
  showVisibleOnly,
  onShowVisibleOnlyChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      <div className="relative flex-1 min-w-0">
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
      <button
        type="button"
        onClick={() => onShowVisibleOnlyChange(!showVisibleOnly)}
        className={`flex h-[44px] shrink-0 items-center gap-2 rounded-[12px] border px-4 font-cairo text-[12px] font-extrabold transition-colors ${
          showVisibleOnly
            ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
            : "border-[#E5E7EB] bg-white text-[#344054] hover:bg-[#F9FAFB]"
        }`}
        aria-label={showVisibleOnly ? "عرض الكل" : "عرض الظاهر فقط"}
      >
        {showVisibleOnly ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        {showVisibleOnly ? "الظاهر فقط" : "الكل"}
      </button>
    </div>
  );
}
