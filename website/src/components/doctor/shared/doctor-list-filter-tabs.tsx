import { cn } from '@/lib/utils/utils';

export type DoctorListFilterTab<T extends string> = {
  value: T;
  label: string;
};

export function DoctorListFilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  columns = 4,
}: {
  tabs: DoctorListFilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4 | 5;
}) {
  const gridClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : columns === 5
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div
      className={cn(
        'grid gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] p-1.5',
        gridClass,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'h-[44px] rounded-[10px] font-cairo text-[13px] font-extrabold transition sm:text-[14px]',
            value === tab.value
              ? 'bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.24)]'
              : 'bg-transparent text-[#475467] hover:bg-white',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
