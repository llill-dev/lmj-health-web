import type { AppointmentSummary } from '@/lib/admin/types';

const SPECIALIZATION_AR: Record<string, string> = {
  Cardiology: 'القلب',
  Dermatology: 'الجلدية',
  Pediatrics: 'الأطفال',
  Neurology: 'الأعصاب',
  Orthopedics: 'العظام',
  Gynecology: 'النساء والتوليد',
  Ophthalmology: 'العيون',
  Urology: 'المسالك البولية',
  Psychiatry: 'الطب النفسي',
  'Internal Medicine': 'الباطنة',
  Surgery: 'الجراحة',
  Oncology: 'الأورام',
  Endocrinology: 'الغدد',
  Pulmonology: 'الرئة',
  Gastroenterology: 'الجهاز الهضمي',
};

export function localizeSpec(spec?: string) {
  if (!spec) return '—';
  return SPECIALIZATION_AR[spec] ?? spec;
}

export const STATUS_LABEL: Record<AppointmentSummary['status'], string> = {
  scheduled: 'مجدول',
  rescheduled: 'معاد جدولته',
  completed: 'مكتمل',
  cancelled: 'ملغى',
  'no-show': 'غياب',
};

export const STATUS_COLOR: Record<AppointmentSummary['status'], string> = {
  scheduled: 'bg-[#E0F2FE] text-[#0369A1]',
  rescheduled: 'bg-[#FEF9C3] text-[#854D0E]',
  completed: 'bg-[#DCFCE7] text-[#15803D]',
  cancelled: 'bg-[#FEE2E2] text-[#B91C1C]',
  'no-show': 'bg-[#F3F4F6] text-[#6B7280]',
};

export function formatDateTime(appt: AppointmentSummary): string {
  const raw = appt.startDateTime ?? appt.date;
  if (!raw) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}
