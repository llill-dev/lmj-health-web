import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

export function ClinicAccountsStatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[12px] bg-primary px-5 py-5 text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        <div className="min-w-0 text-right">
          <p className="font-cairo text-[12px] font-bold opacity-90">{label}</p>
          <p className="mt-2 font-cairo text-[24px] font-black leading-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ClinicAccountsMiniStatCard({
  label,
  value,
  icon: Icon,
  active,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[12px] border bg-white px-4 py-4 text-center shadow-sm',
        active ? 'border-primary ring-2 ring-primary/20' : 'border-[#D1FAE5]',
      )}
    >
      <Icon
        className={cn(
          'mx-auto mb-2 h-5 w-5',
          active ? 'text-primary' : 'text-primary/70',
        )}
        aria-hidden
      />
      <p className="font-cairo text-[22px] font-black text-primary">{value}</p>
      <p className="mt-1 font-cairo text-[12px] font-bold text-[#667085]">
        {label}
      </p>
    </div>
  );
}
