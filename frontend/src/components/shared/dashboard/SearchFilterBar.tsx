import { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface SearchFilterBarProps {
  searchPlaceholder: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
}

export default function SearchFilterBar({
  searchPlaceholder,
  onSearchChange,
  onFilterClick,
}: SearchFilterBarProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm">
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="flex-1 bg-transparent font-cairo text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 font-cairo text-sm font-bold text-[#0f172a] shadow-sm transition hover:bg-gray-50"
      >
        {t("common.filter")}
      </button>
    </div>
  );
}
