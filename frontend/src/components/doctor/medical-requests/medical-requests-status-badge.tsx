import { cn } from '@/lib/utils/utils';
import type { MedicalRequestStatusKey } from './map-doctor-medical-requests';

export function MedicalRequestsStatusBadge({
  statusKey,
  label,
}: {
  statusKey: MedicalRequestStatusKey;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
        statusKey === 'pending'
          ? 'border-2 border-primary bg-white text-primary'
          : 'bg-primary text-white shadow-[0_4px_10px_rgba(15,143,139,0.18)]',
      )}
    >
      {label}
    </span>
  );
}
