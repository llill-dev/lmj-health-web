import type { AppointmentSummary } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

export function AppointmentStatusChip({
  status,
}: {
  status?: AppointmentSummary['status'];
}) {
  const { t } = useI18n();
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
      ? t('adminAppointments.chip.completed')
      : status === 'scheduled'
        ? t('adminAppointments.chip.scheduled')
        : status === 'rescheduled'
          ? t('adminAppointments.chip.rescheduled')
          : status === 'cancelled'
            ? t('adminAppointments.chip.cancelled')
            : status === 'no-show'
              ? t('adminAppointments.chip.noShow')
              : '—';

  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full px-2.5 font-cairo text-[11px] font-extrabold ${tone}`}
    >
      {label}
    </span>
  );
}
