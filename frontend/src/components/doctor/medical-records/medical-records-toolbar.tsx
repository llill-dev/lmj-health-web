import { Search, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function MedicalRecordsToolbar({
  search,
  onSearchChange,
  onClear,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
}) {
  const { dir, t } = useI18n();

  return (
    <label className="relative block w-full min-w-0" dir={dir}>
      <span className="sr-only">{t("doctor.medicalRecords.searchLabel")}</span>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("doctor.medicalRecords.searchPlaceholder")}
        className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-11 pe-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
      />
      {search && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute start-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={t("common.clearSearch")}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <Search
          className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
      )}
    </label>
  );
}
