import type { ConsultationTicketSummary } from '@/lib/consultations/client';
import { getCurrentLocale, type AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';

function tr(locale: AppLocale, key: string, fallback: string): string {
  return getTranslationValue(locale, key) ?? fallback;
}

export type UiConsultationStatus = 'closed' | 'dismissed' | 'in_progress' | 'waiting';

export type UiConsultationListItem = {
  id: string;
  status: UiConsultationStatus;
  statusLabel: string;
  priorityLabel: string;
  title: string;
  createdAtLabel: string;
  lastUpdateLabel: string;
  repliesCount: number;
  patientName: string;
  patientInitial: string;
  patientEmail: string;
  patientPhone: string;
  description: string;
  symptoms: string[];
  historyNote: string;
  messages: Array<{
    id: string;
    author: 'patient' | 'doctor';
    authorName: string;
    text: string;
    timeLabel: string;
    isNew?: boolean;
  }>;
};

function mapStatus(
  status?: string,
): UiConsultationStatus {
  if (status === 'active') return 'in_progress';
  if (status === 'pending') return 'waiting';
  if (status === 'dismissed') return 'dismissed';
  return 'closed';
}

function statusLabel(status: UiConsultationStatus, locale: AppLocale) {
  if (status === 'in_progress') {
    return tr(locale, 'doctor.consultations.status.in_progress', 'قيد المعالجة');
  }
  if (status === 'waiting') {
    return tr(locale, 'doctor.consultations.status.waiting', 'بالانتظار');
  }
  if (status === 'dismissed') {
    return tr(locale, 'doctor.consultations.status.dismissed', 'مرفوضة');
  }
  return tr(locale, 'doctor.consultations.status.closed', 'مغلقة');
}

function formatDateLabel(iso?: string, locale: AppLocale = 'ar') {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.slice(0, 10);
  return new Date(t).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SY');
}

export function mapConsultationTicketToUi(
  ticket: ConsultationTicketSummary,
  locale: AppLocale = getCurrentLocale(),
): UiConsultationListItem {
  const patientName =
    ticket.patientSummary?.userId?.fullName?.trim() ||
    tr(locale, 'doctor.appointmentCard.patientFallback', 'مريض');
  const status = mapStatus(ticket.status);

  return {
    id: ticket._id ?? '',
    status,
    statusLabel: statusLabel(status, locale),
    priorityLabel:
      (ticket.unreadForDoctor ?? 0) > 0
        ? locale === 'en'
          ? 'High'
          : 'عالية'
        : locale === 'en'
          ? 'Normal'
          : 'عادية',
    title: ticket.subject?.trim() || (locale === 'en' ? 'Consultation' : 'استشارة'),
    createdAtLabel: formatDateLabel(ticket.createdAt, locale),
    lastUpdateLabel: formatDateLabel(ticket.updatedAt ?? ticket.lastMessageAt, locale),
    repliesCount: ticket.messageCount ?? 0,
    patientName,
    patientInitial: patientName.charAt(0) || (locale === 'en' ? 'P' : 'م'),
    patientEmail: '',
    patientPhone: '',
    description: ticket.description?.trim() || ticket.subject?.trim() || '',
    symptoms: [],
    historyNote: '',
    messages: [],
  };
}
