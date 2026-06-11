import { cn } from '@/lib/utils/utils';
import type { PrescriptionHubStatusKey } from './map-prescriptions-hub';

const STATUS_STYLES: Record<PrescriptionHubStatusKey, string> = {
  active: 'bg-[#DCFCE7] text-[#166534]',
  emergency: 'bg-[#FEE2E2] text-[#B91C1C]',
  follow_up: 'bg-[#FEF3C7] text-[#B45309]',
  closed: 'bg-[#374151] text-white',
  archived: 'bg-[#E5E7EB] text-[#4B5563]',
};

export function PrescriptionsHubStatusBadge({
  statusKey,
  label,
}: {
  statusKey: PrescriptionHubStatusKey;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[96px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
        STATUS_STYLES[statusKey],
      )}
    >
      {label}
    </span>
  );
}
