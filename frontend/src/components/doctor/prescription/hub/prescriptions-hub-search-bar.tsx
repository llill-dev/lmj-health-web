import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function PrescriptionsHubSearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

  return (
    <label className="relative block" dir={dir}>
      <span className="sr-only">{tr("ابحث عن مريض", "Search patient")}</span>
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={tr("ابحث عن مريض...", "Search patient...")}
        className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-4 pe-11 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
      />
      <Search
        className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
        aria-hidden
      />
    </label>
  );
}
