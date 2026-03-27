export type ApiSuccessEnvelope = {
  messageKey?: string;
  message?: string;
};

export type AppointmentStatus =
  | 'scheduled'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type AppointmentSummary = {
  _id: string;
  status: AppointmentStatus;
  startTime?: string;
  date?: string; // sometimes returned as ISO date string
  startDateTime?: string;
  doctor?: {
    _id: string;
    specialization?: string;
    userId?: { _id: string; fullName: string };
  };
  patient?: {
    _id: string;
    publicId?: string;
    userId?: { _id: string; fullName: string };
  };
  notes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
};

export type AppointmentDetailsResponse = ApiSuccessEnvelope & {
  appointment: AppointmentSummary;
};

export type AppointmentCancelResponse = ApiSuccessEnvelope & {
  appointment: Pick<
    AppointmentSummary,
    '_id' | 'status' | 'cancelledAt' | 'cancelledBy' | 'cancelReason'
  >;
};

export type VerificationRequestReviewDecision = 'approved' | 'rejected';

export type VerificationRequestReviewBody = {
  decision: VerificationRequestReviewDecision;
  adminNote?: string | null;
  clinicLat?: number;
  clinicLng?: number;
  verifyLocation?: boolean;
};

export type AuditLogItem = {
  _id: string;
  category: 'AUTH' | 'AUTHZ' | 'PHI' | 'DATA' | 'ADMIN' | 'SYSTEM';
  outcome: 'SUCCESS' | 'FAIL' | 'DENY';
  action: string;
  createdAt: string;
  actorRole?: string;
  actorId?: string;
  ip?: string;
  method?: string;
  route?: string;
  requestId?: string;
};

export type AuditLogsResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  logs: AuditLogItem[] | AuditLogItem[];
  auditLogs?: AuditLogItem[];
};

