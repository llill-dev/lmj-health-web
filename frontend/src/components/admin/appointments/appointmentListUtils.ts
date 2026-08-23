import type { AppointmentStatus, AppointmentSummary } from '@/lib/admin/types';
import type { AppLocale } from '@/i18n/runtime';

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

const STATUS_LABEL_MAP: Record<AppointmentStatus, { ar: string; en: string }> = {
  scheduled: { ar: 'مجدولة', en: 'Scheduled' },
  rescheduled: { ar: 'معاد جدولتها', en: 'Rescheduled' },
  completed: { ar: 'مكتملة', en: 'Completed' },
  cancelled: { ar: 'ملغية', en: 'Cancelled' },
  'no-show': { ar: 'عدم حضور', en: 'No-show' },
};

export function statusLabel(status: AppointmentStatus, locale: AppLocale = 'ar'): string {
  return STATUS_LABEL_MAP[status]?.[locale] ?? status;
}

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

export function formatPatientLabel(
  patient: AppointmentSummary['patient'] | null | undefined,
) {
  const fullName = patient?.userId?.fullName?.trim();
  const publicId = patient?.publicId?.trim();

  if (fullName && publicId) return `${fullName} (${publicId})`;
  if (fullName) return fullName;
  if (publicId) return publicId;
  return '—';
}
