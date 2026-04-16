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
  _id: string; /* `AdminDoctorsListParams` is a TypeScript interface that defines the shape of the
  parameters that can be passed to the `list` method in the `doctors` object of the
  `adminApi`. It includes optional properties such as `status`, `search`,
  `specialization`, `city`, `country`, `from`, `to`, `page`, and `limit` that can
  be used to filter and paginate the list of doctors returned by the API endpoint. */

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

export type AdminAppointmentsListParams = {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD
};

export type AdminAppointmentsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  appointments: AppointmentSummary[];
};

export type PatientAccountStatus =
  | 'active'
  | 'temporary'
  | 'suspended'
  | 'locked';

export type AdminPatientSummary = {
  _id: string;
  publicId: string;
  createdAt?: string;
  user: {
    fullName: string;
    email?: string;
    phone?: string;
    accountStatus: PatientAccountStatus;
    mustChangePassword?: boolean;
    photoUrl?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  isClaimed?: boolean;
  claimedAt?: string | null;
  suspendedAt?: string | null;
  suspendReason?: string | null;
};

export type AdminPatientsAccountStatusFilter = PatientAccountStatus | 'all';

export type AdminPatientsListParams = {
  account_status?: AdminPatientsAccountStatusFilter;
  search?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
};

export type AdminPatientsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  patients: AdminPatientSummary[];
};

export type AdminPatientDetailsResponse = ApiSuccessEnvelope & {
  patient: AdminPatientSummary;
};

export type AdminPatientFileItem = {
  _id: string;
  id?: string;
  patientId: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  isArchived?: boolean;
  createdAt?: string;
  note?: string;
  tags?: string[];
};

export type AdminPatientFilesListParams = {
  page?: number;
  limit?: number;
  archived?: boolean;
  search?: string;
};

export type AdminPatientFilesListResponse = ApiSuccessEnvelope & {
  items: AdminPatientFileItem[];
  pageInfo?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type AdminPatientFileDownloadUrlResponse = ApiSuccessEnvelope & {
  url?: string;
  downloadUrl?: string;
  expiresIn?: number;
};

export type AdminPatientAccountActionResponse = ApiSuccessEnvelope & {
  patientId: string;
  userId: string;
  accountStatus: PatientAccountStatus;
};

export type VerificationRequestReviewDecision = 'approved' | 'rejected';

export type VerificationRequestReviewBody = {
  decision: VerificationRequestReviewDecision;
  adminNote?: string | null;
  clinicLat?: number;
  clinicLng?: number;
  verifyLocation?: boolean;
};

export type AuditLogCategory = 'AUTH' | 'AUTHZ' | 'PHI' | 'DATA' | 'ADMIN' | 'SYSTEM';
export type AuditLogOutcome = 'SUCCESS' | 'FAIL' | 'DENY';

export type AuditLogItem = {
  _id: string;
  category: AuditLogCategory;
  outcome: AuditLogOutcome;
  action: string;
  createdAt: string;
  actorUserId?: string;
  actorUserName?: string;
  actorRole?: string;
  entityType?: string;
  entityId?: string;
  patientId?: string | null;
  patientName?: string | null;
  patientPublicId?: string | null;
  targetUserId?: string | null;
  targetUserName?: string | null;
  requestId?: string;
  ip?: string;
  route?: string;
  method?: string;
};

export type AuditLogsListParams = {
  page?: number;
  limit?: number;
  actorUserId?: string;
  actorRole?: string;
  category?: AuditLogCategory;
  action?: string;
  outcome?: AuditLogOutcome;
  entityType?: string;
  entityId?: string;
  patientId?: string;
  targetUserId?: string;
  requestId?: string;
  ip?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type AuditLogsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  auditLogs: AuditLogItem[];
};

export type AdminDoctorApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AdminDoctorSummary = {
  _id: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  education?: string;
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
  consultationTypes?: Array<'online' | 'offline' | string>;
  locationCity?: string;
  locationCountry?: string;
  isApproved?: boolean;
  approvalStatus?: AdminDoctorApprovalStatus;
  approvalNote?: string | null;
  createdAt?: string;
  user?: {
    fullName: string;
    email?: string;
    phone?: string;
    gender?: string;
    photoUrl?: string;
  };
};

export type AdminDoctorsListParams = {
  status?: AdminDoctorApprovalStatus;
  search?: string;
  specialization?: string;
  city?: string;
  country?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type AdminDoctorsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  doctors: AdminDoctorSummary[];
};

export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

export type VerificationRequestSummary = {
  _id: string;
  status: VerificationRequestStatus;
  adminNote?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  requestedChanges?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  doctor?: {
    _id: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    clinicAddress?: string;
    locationCity?: string;
    locationCountry?: string;
    clinicLocation?: {
      type?: 'Point';
      coordinates?: [number, number];
    };
    userId?: {
      _id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      photoUrl?: string;
    };
  };
  requestedBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
};

export type VerificationRequestsListParams = {
  status?: VerificationRequestStatus;
  page?: number;
  limit?: number;
};

export type VerificationRequestsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  requests: VerificationRequestSummary[];
};

export type VerificationRequestDetailsResponse = ApiSuccessEnvelope & {
  request?: VerificationRequestSummary;
  verificationRequest?: VerificationRequestSummary;
  item?: VerificationRequestSummary;
  data?: VerificationRequestSummary;
};

export type AdminSecretarySummary = {
  _id: string;
  userId?: string;
  permissions?: string[];
  assignedDoctor?: string;
  user?: {
    _id?: string;
    fullName: string;
    email?: string;
    phone?: string;
    gender?: string;
    photoUrl?: string;
    accountStatus?: string;
  };
  doctor?: {
    _id: string;
    specialization?: string;
    isApproved?: boolean;
    approvalStatus?: AdminDoctorApprovalStatus;
    user?: { fullName: string; email?: string; phone?: string };
  };
};

export type AdminUserOffboardResponse = ApiSuccessEnvelope & {
  userId: string;
  role: string;
};

export type AdminSecretariesListParams = {
  search?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
};

export type AdminSecretariesListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  secretaries: AdminSecretarySummary[];
};

export type AdminDoctorDetailsResponse = ApiSuccessEnvelope & {
  doctor: {
    _id: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    isApproved?: boolean;
    approvalStatus?: AdminDoctorApprovalStatus;
    approvalNote?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    user?: {
      fullName: string;
      email?: string;
      phone?: string;
      gender?: string;
      photoUrl?: string;
    };
    userId?: {
      _id?: string;
      fullName?: string;
      email?: string;
    };
  };
};

export type AdminContentType =
  | 'CONDITION'
  | 'SYMPTOM'
  | 'GENERAL_ADVICE'
  | 'NEWS';

export type AdminContentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type AdminContentListParams = {
  type?: AdminContentType;
  status?: AdminContentStatus;
  language?: 'ar' | 'en';
  page?: number;
  limit?: number;
};

export type AdminContentItem = {
  _id: string;
  type: AdminContentType;
  status: AdminContentStatus;
  title?: string;
  summary?: string;
  language?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  views?: number;
  createdBy?: string | { _id?: string; fullName?: string; email?: string };
  reviewedBy?: string | { _id?: string; fullName?: string; email?: string };
  publishedAt?: string;
};

export type AdminContentListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  items?: AdminContentItem[];
  content?: AdminContentItem[];
  contentItems?: AdminContentItem[];
};

export type AdminContentBlock =
  | { type: 'heading'; level?: number; text?: string }
  | { type: 'paragraph'; text?: string }
  | { type: 'list'; items?: string[]; ordered?: boolean }
  | {
      type: 'callout';
      variant?: 'info' | 'warn' | 'danger';
      title?: string;
      text?: string;
    }
  | {
      type: 'linkCard';
      title?: string;
      url?: string;
      description?: string;
    }
  | {
      type: 'faq';
      items?: Array<{ question?: string; answer?: string }>;
    }
  | { type: 'divider' }
  | { type: string; [key: string]: unknown };

export type AdminContentDetailsItem = AdminContentItem & {
  contentBlocks?: AdminContentBlock[];
  tags?: string[];
  sources?: Array<{ title?: string; url?: string }>;
  disclaimerVersion?: number | string;
  rejectionReason?: string | null;
  templateId?: string | null;
};

export type AdminContentDetailsResponse = ApiSuccessEnvelope & {
  item?: AdminContentDetailsItem;
  content?: AdminContentDetailsItem;
  contentItem?: AdminContentDetailsItem;
  data?: AdminContentDetailsItem;
};
