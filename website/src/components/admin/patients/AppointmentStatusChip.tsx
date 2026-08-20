import type { AppointmentSummary } from '@/lib/admin/types';

export function AppointmentStatusChip({
  status,
}: {
  status?: AppointmentSummary['status'];
}) {
  const tone =
    status === 'completed'
      ? 'bg-[#ECFDF3] text-[#16A34A]'
      : status === 'scheduled' || status === 'rescheduled'
        ? 'bg-[#E0F2FE] text-[#0369A1]'
        : status === 'cancelled'
          ? 'bg-[#FEE2E2] text-[#B42318]'
          : 'bg-[#F3F4F6] text-[#667085]';

  const label =
    status === 'completed'
      ? 'مكتمل'
      : status === 'scheduled'
        ? 'مجدول'
        : status === 'rescheduled'
          ? 'معاد جدولته'
          : status === 'cancelled'
            ? 'ملغى'
            : status === 'no-show'
              ? 'لم يحضر'
              : '—';

  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full px-2.5 font-cairo text-[11px] font-extrabold ${tone}`}
    >
      {label}
    </span>
  );
}
