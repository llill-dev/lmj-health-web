import { cn } from '@/lib/utils/utils';
import type { MedicalRecordStatusKey } from './map-doctor-medical-records';

const STATUS_STYLES: Record<MedicalRecordStatusKey, string> = {
  active: 'bg-[#12B76A] text-white shadow-[0_4px_10px_rgba(18,183,106,0.22)]',
  emergency: 'bg-[#F04438] text-white shadow-[0_4px_10px_rgba(240,68,56,0.22)]',
  follow_up: 'bg-[#F79009] text-white shadow-[0_4px_10px_rgba(247,144,9,0.22)]',
  closed: 'bg-[#475467] text-white shadow-[0_4px_10px_rgba(71,84,103,0.18)]',
  archived: 'bg-[#EAECF0] text-[#667085]',
};

export function MedicalRecordStatusBadge({
  statusKey,
  label,
}: {
  statusKey: MedicalRecordStatusKey;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[88px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
        STATUS_STYLES[statusKey],
      )}
    >
      {label}
    </span>
  );
}
