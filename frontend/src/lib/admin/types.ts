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

export type AuditLogCategory =
  | 'AUTH'
  | 'AUTHZ'
  | 'PHI'
  | 'DATA'
  | 'ADMIN'
  | 'SYSTEM';
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
  /** If backend adds client metadata (optional). */
  userAgent?: string;
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
  /** When backend aggregates list stats (optional) */
  appointmentsCount?: number;
  completedAppointmentsCount?: number;
  linkedPatientsCount?: number;
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

/** Matches backend Complaint model (API-3.pdf). */
export type ComplaintType =
  | 'appointment'
  | 'consultation'
  | 'access_request'
  | 'technical'
  | 'other';

export type ComplaintLifecycleStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type ComplaintContactSnapshot = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export type AdminComplaintListItem = {
  _id: string;
  patientId?: string;
  userId?: string;
  type: ComplaintType;
  subject?: string;
  message: string;
  status: ComplaintLifecycleStatus;
  attachmentCount?: number;
  contactSnapshot?: ComplaintContactSnapshot;
  adminRespondedAt?: string | null;
  statusUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminComplaintsListParams = {
  page?: number;
  limit?: number;
  status?: ComplaintLifecycleStatus;
  type?: ComplaintType;
  patientId?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type AdminComplaintsListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  complaints: AdminComplaintListItem[];
};

export type ComplaintStatusHistoryEntry = {
  status: ComplaintLifecycleStatus;
  changedAt: string;
  changedBy: string;
  actorRole: string;
};

export type ComplaintAttachmentRef = {
  fileId: string;
  label?: string;
};

export type AdminComplaintDetail = AdminComplaintListItem & {
  attachments?: ComplaintAttachmentRef[];
  statusHistory?: ComplaintStatusHistoryEntry[];
  adminResponse?: string | null;
  adminRespondedBy?: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
};

export type AdminComplaintDetailsResponse = ApiSuccessEnvelope & {
  complaint: AdminComplaintDetail;
};

export type ComplaintStatusUpdateBody = {
  status: ComplaintLifecycleStatus;
  adminResponse?: string | null;
};

export type ComplaintStatusUpdateResponse = ApiSuccessEnvelope & {
  complaint: {
    _id: string;
    status: ComplaintLifecycleStatus;
    statusUpdatedAt?: string;
    statusHistory?: ComplaintStatusHistoryEntry[];
    adminResponse?: string | null;
    adminRespondedAt?: string | null;
    adminRespondedBy?: string;
    resolvedAt?: string | null;
    closedAt?: string | null;
    updatedAt?: string;
  };
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

/** Payload for `doctor` on GET admin doctor details — aligned with API + admin UI. */
export type AdminDoctorDetailsDoctor = {
  _id: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  education?: string;
  bio?: string;
  clinicAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  consultationFee?: number;
  consultationTypes?: Array<'online' | 'offline' | string>;
  clinicLocation?: {
    type?: 'Point';
    coordinates?: [number, number];
  };
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
    dateOfBirth?: string;
  };
  userId?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  /** إن خزّن الباكند معرف طلب التحقق على ملف الطبيب مباشرةً */
  pendingVerificationRequestId?: string;
};

export type AdminDoctorDetailsResponse = ApiSuccessEnvelope & {
  doctor: AdminDoctorDetailsDoctor;
  /** إن ردّ الباكند طلب التحقق المرتبط (API-3.pdf) نستخدمه مباشرةً دون الاعتماد على القائمة فقط. */
  verificationRequest?: VerificationRequestSummary | null;
  /** أحياناً يُرجع الباكند المعرف في جذر الرد بدل تضمين كائن الطلب كاملاً */
  pendingVerificationRequestId?: string;
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

/**
 * جسم إنشاء محتوى (POST /api/admin/content) — مُطابَق مع API-3 (يُنصح بإرسال contentBlocks).
 * @see LMJ Health Backend API Reference — «Admin/editor content / POST /admin/content»
 */
export type CreateAdminContentBody = {
  type: AdminContentType;
  title: string;
  summary?: string;
  language: 'ar' | 'en';
  slug?: string;
  contentBlocks?: AdminContentBlock[];
  sources?: Array<{ title?: string; url?: string }>;
};

export type UpdateAdminContentBody = Partial<CreateAdminContentBody> & {
  status?: AdminContentStatus;
};

export type AdminContentMutationResponse = ApiSuccessEnvelope & {
  item?: AdminContentDetailsItem;
  content?: AdminContentDetailsItem;
  contentItem?: AdminContentDetailsItem;
  data?: AdminContentDetailsItem;
};

/** فئات كتالوج الطلبات الطبية (تحاليل / أشعة / إجراءات / تحويلات) */
export type MedicalOrderCatalogKind =
  | 'lab'
  | 'imaging'
  | 'procedure'
  | 'referral';

export type MedicalOrderCatalogItem = {
  _id: string;
  label: string;
};

export type AdminMedicalOrderCatalogListParams = {
  type: MedicalOrderCatalogKind;
  search?: string;
};

export type AdminMedicalOrderCatalogListResponse = ApiSuccessEnvelope & {
  items?: MedicalOrderCatalogItem[];
};

export type AdminMedicalOrderCatalogUpsertBody = {
  kind: MedicalOrderCatalogKind;
  label: string;
};

export type AdminMedicalOrderCatalogMutationResponse = ApiSuccessEnvelope & {
  item?: MedicalOrderCatalogItem;
};
