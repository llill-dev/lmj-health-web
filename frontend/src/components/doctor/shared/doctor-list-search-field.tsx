import { Search, X } from 'lucide-react';

export function DoctorListSearchField({
  value,
  onChange,
  placeholder = 'ابحث...',
  ariaLabel = 'بحث',
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  onClear?: () => void;
}) {
  return (
    <label className="relative block" dir="rtl">
      <span className="sr-only">{ariaLabel}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white ps-4 pe-11 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/20 placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2"
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute end-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="مسح البحث"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <Search
          className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
          aria-hidden
        />
      )}
    </label>
  );
}
