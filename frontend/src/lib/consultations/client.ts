import { get, patch, post } from '@/lib/api';
import type {
  ConsultationAttachmentFile,
  ConsultationReviewInput,
  ConsultationReview,
} from '@/lib/consultations/types';

export type {
  ConsultationAttachmentFile,
  ConsultationReview,
  ConsultationReviewInput,
};

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
  attachmentFiles?: ConsultationAttachmentFile[];
};

export type ConsultationTicketDetails = ConsultationTicketSummary & {
  review?: ConsultationReview | null;
  attachmentFiles?: ConsultationAttachmentFile[];
};

export type ConsultationTicketDetailsResponse = {
  ticket?: ConsultationTicketDetails;
  messages?: ConsultationMessage[];
};

export type ConsultationReviewResponse = {
  ticket?: ConsultationTicketDetails;
  review?: ConsultationReview;
  message?: string;
};

export type ConsultationMessageMutationResponse = {
  message?: ConsultationMessage;
  ticket?: ConsultationTicketDetails;
};

export type ConsultationStatusMutationResponse = {
  ticket?: ConsultationTicketSummary;
  message?: string;
};

export type ConsultationSendMessageInput = {
  content: string;
  attachments?: string[];
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

  sendMessage: (ticketId: string, body: ConsultationSendMessageInput) =>
    post<ConsultationMessageMutationResponse>(
      `/api/consultations/${ticketId}/messages`,
      body,
      { locale: 'ar' },
    ),

  updateStatus: (
    ticketId: string,
    body: { status: 'closed' | 'dismissed'; reason?: string },
  ) =>
    patch<ConsultationStatusMutationResponse>(
      `/api/consultations/${ticketId}/status`,
      body,
      { locale: 'ar' },
    ),

  markRead: (ticketId: string) =>
    post<ConsultationStatusMutationResponse>(
      `/api/consultations/${ticketId}/mark-read`,
      {},
      { locale: 'ar' },
    ),

  review: (ticketId: string, body: ConsultationReviewInput) =>
    post<ConsultationReviewResponse>(
      `/api/consultations/${ticketId}/review`,
      body,
      { locale: 'ar' },
    ),
};
