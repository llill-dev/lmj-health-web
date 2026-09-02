import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function PrescriptionsHubSearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const { t, dir } = useI18n();

  return (
    <label className="relative block" dir={dir}>
      <span className="sr-only">{t("doctor.prescription.hub.searchPatientAria")}</span>
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t("doctor.medicalRecords.searchPlaceholder")}
        className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-11 pe-4 text-start font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
      />
      <Search
        className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
        aria-hidden
      />
    </label>
  );
}
