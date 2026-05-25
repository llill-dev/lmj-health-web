import { get, patch, post } from '@/lib/api';

export type ConsultationTicketStatus =
  | 'pending'
  | 'active'
  | 'closed'
  | 'dismissed';

export type ConsultationTicketSummary = {
  _id?: string;
  subject?: string;
  description?: string;
  status?: ConsultationTicketStatus;
  closedReason?: string | null;
  cancellationReason?: string | null;
  lastMessageAt?: string;
  lastMessageBy?: string;
  messageCount?: number;
  unreadForDoctor?: number;
  unreadForPatient?: number;
  createdAt?: string;
  updatedAt?: string;
  doctorSummary?: {
    _id?: string;
    fullName?: string;
    specialization?: string;
  };
  patientSummary?: {
    _id?: string;
    publicId?: string;
    userId?: { _id?: string; fullName?: string };
  };
};

export type ConsultationTicketCounts = {
  total?: number;
  open?: number;
  pending?: number;
  active?: number;
  closed?: number;
  dismissed?: number;
};

export type ConsultationsListResponse = {
  tickets?: ConsultationTicketSummary[];
  counts?: ConsultationTicketCounts;
};

export type ConsultationMessage = {
  _id?: string;
  content?: string;
  senderRole?: string;
  createdAt?: string;
  attachments?: string[];
};

export type ConsultationTicketDetailsResponse = {
  ticket?: ConsultationTicketSummary & Record<string, unknown>;
  messages?: ConsultationMessage[];
};

export const consultationsApi = {
  list: (params?: { status?: ConsultationTicketStatus }) => {
    const qs = params?.status
      ? `?status=${encodeURIComponent(params.status)}`
      : '';
    return get<ConsultationsListResponse>(`/api/consultations${qs}`, {
      locale: 'ar',
    });
  },

  getById: (ticketId: string) =>
    get<ConsultationTicketDetailsResponse>(`/api/consultations/${ticketId}`, {
      locale: 'ar',
    }),

  sendMessage: (ticketId: string, content: string) =>
    post<{ message?: string }>(
      `/api/consultations/${ticketId}/messages`,
      { content },
      { locale: 'ar' },
    ),

  updateStatus: (
    ticketId: string,
    body: { status: 'closed' | 'dismissed'; reason?: string },
  ) =>
    patch<{ ticket?: ConsultationTicketSummary; message?: string }>(
      `/api/consultations/${ticketId}/status`,
      body,
      { locale: 'ar' },
    ),

  markRead: (ticketId: string) =>
    post<{ ticket?: ConsultationTicketSummary; message?: string }>(
      `/api/consultations/${ticketId}/mark-read`,
      {},
      { locale: 'ar' },
    ),
};
