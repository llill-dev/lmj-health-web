import { cn } from '@/lib/utils/utils';

const STATUS_STYLES: Record<string, string> = {
  active: 'border-2 border-primary bg-white text-primary',
  contacted: 'bg-[#175CD3] text-white shadow-[0_4px_10px_rgba(23,92,211,0.2)]',
  booked: 'bg-[#12B76A] text-white shadow-[0_4px_10px_rgba(18,183,106,0.22)]',
  closed: 'bg-[#475467] text-white shadow-[0_4px_10px_rgba(71,84,103,0.18)]',
  cancelled: 'bg-[#EAECF0] text-[#667085]',
  expired: 'bg-[#FEF3F2] text-[#B42318]',
};

export function WaitlistStatusBadge({
  status,
  label,
}: {
  status?: string;
  label: string;
}) {
  const key = status?.trim() || 'active';
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
        STATUS_STYLES[key] ?? 'bg-[#F0FDFA] text-primary',
      )}
    >
      {label}
    </span>
  );
}

const URGENCY_DOT: Record<string, string> = {
  high: 'bg-[#F04438]',
  medium: 'bg-[#F79009]',
  low: 'bg-[#12B76A]',
};

export function WaitlistUrgencyBadge({
  urgency,
  label,
}: {
  urgency?: string;
  label: string;
}) {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054]">
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          URGENCY_DOT[urgency ?? ''] ?? 'bg-[#98A2B3]',
        )}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
