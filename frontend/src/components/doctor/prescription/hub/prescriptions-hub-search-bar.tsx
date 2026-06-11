import { Search } from 'lucide-react';

export function PrescriptionsHubSearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <label className="relative block" dir="rtl">
      <span className="sr-only">ابحث عن مريض</span>
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="ابحث عن مريض..."
        className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-4 pe-11 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
      />
      <Search
        className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
        aria-hidden
      />
    </label>
  );
}
