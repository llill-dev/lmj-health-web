import type { ConsultationTicketSummary } from '@/lib/consultations/client';

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

function statusLabelAr(status: UiConsultationStatus) {
  if (status === 'in_progress') return 'قيد المعالجة';
  if (status === 'waiting') return 'بالانتظار';
  if (status === 'dismissed') return 'مرفوضة';
  return 'مغلقة';
}

function formatDateLabel(iso?: string) {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.slice(0, 10);
  return new Date(t).toLocaleDateString('ar-SY');
}

export function mapConsultationTicketToUi(
  ticket: ConsultationTicketSummary,
): UiConsultationListItem {
  const patientName =
    ticket.patientSummary?.userId?.fullName?.trim() || 'مريض';
  const status = mapStatus(ticket.status);

  return {
    id: ticket._id ?? '',
    status,
    statusLabel: statusLabelAr(status),
    priorityLabel: (ticket.unreadForDoctor ?? 0) > 0 ? 'عالية' : 'عادية',
    title: ticket.subject?.trim() || 'استشارة',
    createdAtLabel: formatDateLabel(ticket.createdAt),
    lastUpdateLabel: formatDateLabel(ticket.updatedAt ?? ticket.lastMessageAt),
    repliesCount: ticket.messageCount ?? 0,
    patientName,
    patientInitial: patientName.charAt(0) || 'م',
    patientEmail: '',
    patientPhone: '',
    description: ticket.description?.trim() || ticket.subject?.trim() || '',
    symptoms: [],
    historyNote: '',
    messages: [],
  };
}
