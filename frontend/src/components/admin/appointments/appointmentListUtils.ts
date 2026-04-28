import type { AppointmentStatus, AppointmentSummary } from '@/lib/admin/types';

export type UiAppointmentCard = {
  id: string;
  status: AppointmentStatus;
  typeLabel: 'clinic';
  code: string;
  doctorName: string;
  doctorSpecialization?: string;
  dateLabel: string;
  patientLabel: string;
  time: string;
};

export const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: 'مجدولة',
  rescheduled: 'معاد جدولتها',
  completed: 'مكتملة',
  cancelled: 'ملغية',
  'no-show': 'عدم حضور',
};

export const statusPill: Record<AppointmentStatus, string> = {
  completed: 'bg-[#DCFCE7] text-[#16A34A]',
  'no-show': 'bg-[#F3F4F6] text-[#4B5563]',
  cancelled: 'bg-[#FEF2F2] text-[#EF4444]',
  scheduled: 'bg-[#E0F2FE] text-[#0284C7]',
  rescheduled: 'bg-[#E0F2FE] text-[#0284C7]',
};

export function formatDateLabel(a: AppointmentSummary) {
  const iso = a.date ?? a.startDateTime;
  if (!iso) return '—';

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().slice(0, 10);
}
