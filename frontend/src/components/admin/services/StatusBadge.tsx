import type { FacilityStatus } from '@/lib/admin/services/types';

const MAP: Record<FacilityStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'نشط', cls: 'bg-emerald-50 text-emerald-700' },
  PENDING: { label: 'معلّق', cls: 'bg-amber-50 text-amber-700' },
  INACTIVE: { label: 'غير نشط', cls: 'bg-gray-100 text-gray-500' },
  DELETED: { label: 'محذوف', cls: 'bg-red-50 text-red-600' },
};

export function StatusBadge({ status }: { status: FacilityStatus }) {
  const { label, cls } = MAP[status] ?? MAP.INACTIVE;
  return (
    <span
      className={`inline-flex items-center rounded-[6px] px-2 py-0.5 font-cairo text-[11px] font-extrabold ${cls}`}
    >
      {label}
    </span>
  );
}
