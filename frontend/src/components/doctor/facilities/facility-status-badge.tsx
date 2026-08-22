import {
  FACILITY_STATUS_LABELS,
  type DoctorFacilityStatus,
} from '@/lib/doctor/facilities/types';
import { cn } from '@/lib/utils/utils';

const STYLES: Record<DoctorFacilityStatus, string> = {
  active: 'bg-[#DCFCE7] text-[#16A34A]',
  pending: 'bg-[#FEF3C7] text-[#D97706]',
  closed: 'bg-[#F3F4F6] text-[#667085]',
};

export function FacilityStatusBadge({ status }: { status: DoctorFacilityStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 font-cairo text-[11px] font-extrabold',
        STYLES[status],
      )}
    >
      {FACILITY_STATUS_LABELS[status]}
    </span>
  );
}
