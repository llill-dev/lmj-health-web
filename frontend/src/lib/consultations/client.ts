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

type ConsultationsEnvelope = {
  tickets?: unknown;
  ticket?: unknown;
  messages?: unknown;
  counts?: unknown;
  review?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
};

function asConsultationsEnvelope(value: unknown): ConsultationsEnvelope | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ConsultationsEnvelope)
    : null;
}

function isConsultationRecordArray<T extends object>(value: unknown): value is T[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && !Array.isArray(item))
  );
}

function readConsultationTickets(
  value: unknown,
): ConsultationTicketSummary[] | undefined {
  const record = asConsultationsEnvelope(value);
  if (!record) return undefined;

  return (
    (isConsultationRecordArray<ConsultationTicketSummary>(record.tickets)
      ? record.tickets
      : undefined) ??
    readConsultationTickets(record.data) ??
    readConsultationTickets(record.result)
  );
}

function readConsultationCounts(
  value: unknown,
): ConsultationTicketCounts | undefined {
  const record = asConsultationsEnvelope(value);
  if (!record) return undefined;

  const counts =
    record.counts && typeof record.counts === 'object' && !Array.isArray(record.counts)
      ? (record.counts as ConsultationTicketCounts)
      : undefined;

  return counts ?? readConsultationCounts(record.data) ?? readConsultationCounts(record.result);
}

function readConsultationTicketDetails(
  value: unknown,
): ConsultationTicketDetails | undefined {
  const record = asConsultationsEnvelope(value);
  if (!record) return undefined;

  const ticket =
    record.ticket && typeof record.ticket === 'object' && !Array.isArray(record.ticket)
      ? (record.ticket as ConsultationTicketDetails)
      : record.item && typeof record.item === 'object' && !Array.isArray(record.item)
        ? (record.item as ConsultationTicketDetails)
        : undefined;

  return (
    ticket ??
    readConsultationTicketDetails(record.data) ??
    readConsultationTicketDetails(record.result)
  );
}

function readConsultationMessages(
  value: unknown,
): ConsultationMessage[] | undefined {
  const record = asConsultationsEnvelope(value);
  if (!record) return undefined;

  return (
    (isConsultationRecordArray<ConsultationMessage>(record.messages)
      ? record.messages
      : undefined) ??
    readConsultationMessages(record.data) ??
    readConsultationMessages(record.result)
  );
}

function readConsultationReview(
  value: unknown,
): ConsultationReview | undefined {
  const record = asConsultationsEnvelope(value);
  if (!record) return undefined;

  const review =
    record.review && typeof record.review === 'object' && !Array.isArray(record.review)
      ? (record.review as ConsultationReview)
      : undefined;

  return review ?? readConsultationReview(record.data) ?? readConsultationReview(record.result);
}

function normalizeConsultationsListResponse(
  response: ConsultationsListResponse,
): ConsultationsListResponse {
  return {
    ...response,
    tickets: readConsultationTickets(response) ?? [],
    counts: readConsultationCounts(response) ?? response.counts,
  };
}

function normalizeConsultationTicketDetailsResponse(
  response: ConsultationTicketDetailsResponse,
): ConsultationTicketDetailsResponse {
  return {
    ...response,
    ticket: readConsultationTicketDetails(response) ?? response.ticket,
    messages: readConsultationMessages(response) ?? response.messages,
  };
}

function normalizeConsultationReviewResponse(
  response: ConsultationReviewResponse,
): ConsultationReviewResponse {
  return {
    ...response,
    ticket: readConsultationTicketDetails(response) ?? response.ticket,
    review: readConsultationReview(response) ?? response.review,
  };
}

function normalizeConsultationMessageMutationResponse(
  response: ConsultationMessageMutationResponse,
): ConsultationMessageMutationResponse {
  return {
    ...response,
    ticket: readConsultationTicketDetails(response) ?? response.ticket,
    message:
      (readConsultationMessages(response)?.[0] as ConsultationMessage | undefined) ??
      response.message,
  };
}

function normalizeConsultationStatusMutationResponse(
  response: ConsultationStatusMutationResponse,
): ConsultationStatusMutationResponse {
  return {
    ...response,
    ticket: readConsultationTicketDetails(response) ?? response.ticket,
  };
}

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
    }).then(normalizeConsultationsListResponse);
  },

  getById: (ticketId: string) =>
    get<ConsultationTicketDetailsResponse>(`/api/consultations/${ticketId}`, {
      locale: 'ar',
    }).then(normalizeConsultationTicketDetailsResponse),

  sendMessage: (ticketId: string, body: ConsultationSendMessageInput) =>
    post<ConsultationMessageMutationResponse>(
      `/api/consultations/${ticketId}/messages`,
      body,
      { locale: 'ar' },
    ).then(normalizeConsultationMessageMutationResponse),

  updateStatus: (
    ticketId: string,
    body: { status: 'closed' | 'dismissed'; reason?: string },
  ) =>
    patch<ConsultationStatusMutationResponse>(
      `/api/consultations/${ticketId}/status`,
      body,
      { locale: 'ar' },
    ).then(normalizeConsultationStatusMutationResponse),

  markRead: (ticketId: string) =>
    post<ConsultationStatusMutationResponse>(
      `/api/consultations/${ticketId}/mark-read`,
      {},
      { locale: 'ar' },
    ).then(normalizeConsultationStatusMutationResponse),

  review: (ticketId: string, body: ConsultationReviewInput) =>
    post<ConsultationReviewResponse>(
      `/api/consultations/${ticketId}/review`,
      body,
      { locale: 'ar' },
    ).then(normalizeConsultationReviewResponse),
};
