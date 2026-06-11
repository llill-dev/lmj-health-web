'use client';

import type { AccountsPeriod } from '@/lib/doctor/clinicAccounts/types';
import { cn } from '@/lib/utils/utils';

const OPTIONS: { id: AccountsPeriod; label: string }[] = [
  { id: 'week', label: 'الأسبوع' },
  { id: 'month', label: 'الشهر' },
  { id: 'custom', label: 'مخصص' },
  { id: 'day', label: 'اليوم' },
];

export function ClinicAccountsPeriodFilter({
  value,
  onChange,
}: {
  value: AccountsPeriod;
  onChange: (value: AccountsPeriod) => void;
}) {
  return (
    <div className="grid w-full grid-cols-4 gap-1 rounded-[10px] border border-[#EEF2F6] bg-white p-1 shadow-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'rounded-[8px] px-2 py-2 font-cairo text-[12px] font-extrabold transition sm:px-3',
            value === option.id
              ? 'bg-primary text-white shadow-sm'
              : 'text-[#667085] hover:bg-[#F0FDFA] hover:text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ClinicAccountsFilterTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string }>;
}) {
  return (
    <div
      className="mb-4 grid w-full gap-2"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'w-full rounded-[10px] border px-2 py-2 font-cairo text-[12px] font-extrabold transition sm:px-3',
            value === option.id
              ? 'border-primary bg-primary text-white'
              : 'border-[#EEF2F6] bg-white text-[#667085] hover:border-primary/30 hover:text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
