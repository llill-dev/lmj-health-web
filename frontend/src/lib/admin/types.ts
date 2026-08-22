export type ApiSuccessEnvelope = {
  messageKey?: string;
  message?: string;
};

export type AppointmentStatus =
  | "scheduled"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type AppointmentSummary = {
  _id: string;

  status: AppointmentStatus;
  startTime?: string;
  /** API may return either YYYY-MM-DD or full ISO datetime-like string depending on source aggregate. */
  date?: string;
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
  /** معرّف نوع الموعد (مرجع)، والاسم/السعر يأتيان من لقطة الموعد المخزّنة. */
  appointmentType?: string;
  appointmentTypeNameSnapshot?: string;
  priceSnapshot?: number | null;
  priceVisibleToPatientSnapshot?: boolean;
  encounter?: {
    _id?: string;
    status?: string;
    origin?: string;
    startedAt?: string;
    closedAt?: string;
  } | null;
  files?: Array<{
    _id: string;
    id?: string;
    appointmentLinkId?: string;
    appointmentId?: string;
    patientId?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    linkedAt?: string;
    linkedByRole?: string;
    linkedByUserId?: string;
    isArchived?: boolean;
  }>;
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
    "_id" | "status" | "cancelledAt" | "cancelledBy" | "cancelReason"
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
  | "active"
  | "temporary"
  | "suspended"
  | "locked";

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

export type AdminPatientsAccountStatusFilter = PatientAccountStatus | "all";

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

export type AdminAccessRequestSummary = {
  _id?: string;
  id?: string;
  status?: string;
  doctorId?: string;
  patientId?: string;
  reason?: string;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminAccessRequestsListResponse = ApiSuccessEnvelope & {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  requests?: AdminAccessRequestSummary[];
  accessRequests?: AdminAccessRequestSummary[];
  items?: AdminAccessRequestSummary[];
};

export type AdminAccessRequestDetailsResponse = ApiSuccessEnvelope & {
  request?: AdminAccessRequestSummary;
  accessRequest?: AdminAccessRequestSummary;
  item?: AdminAccessRequestSummary;
  data?: AdminAccessRequestSummary;
};

export type VerificationRequestReviewDecision = "approved" | "rejected";

export type VerificationRequestNewSpecializationBody = {
  key: string;
  text: {
    en?: string;
    ar?: string;
  };
};

export type VerificationRequestReviewBody = {
  decision: VerificationRequestReviewDecision;
  adminNote?: string | null;
  clinicLat?: number;
  clinicLng?: number;
  verifyLocation?: boolean;
  /** ربط تخصص مخصص معلّق بتخصص مُدار (API-3). */
  specializationLookupId?: string;
  /** إنشاء تخصص lookup جديد وربطه فوراً (API-3). */
  newSpecialization?: VerificationRequestNewSpecializationBody;
};

export type AuditLogCategory =
  | "AUTH"
  | "AUTHZ"
  | "PHI"
  | "DATA"
  | "ADMIN"
  | "SYSTEM";
export type AuditLogOutcome = "SUCCESS" | "FAIL" | "DENY";

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

export type AdminDoctorApprovalStatus = "pending" | "approved" | "rejected";

export type AdminDoctorSummary = {
  _id: string;
  specialization?: string;
  medicalLicenseNumber?: string;
  education?: string;
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
  consultationTypes?: Array<"online" | "offline" | string>;
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
  userId?:
    | string
    | {
        _id?: string;
        fullName?: string;
        email?: string;
        phone?: string;
        accountDeletionStatus?: string;
        accountDeletion?: { status?: string | null } | null;
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

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export type VerificationRequestChangesPayload = {
  [key: string]: unknown;
};

export type VerificationRequestSummary = {
  _id: string;
  status: VerificationRequestStatus;
  adminNote?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  requestedChanges?: VerificationRequestChangesPayload;
  changes?: VerificationRequestChangesPayload;
  doctor?: {
    _id: string;
    specialization?: string;
    specializationKey?: string | null;
    customSpecializationText?: string | null;
    customSpecializationPending?: boolean;
    customSpecializationStatus?: string | null;
    medicalLicenseNumber?: string;
    clinicAddress?: string;
    locationCity?: string;
    locationCountry?: string;
    clinicLocation?: {
      type?: "Point";
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

export type VerificationRequestReviewResponse = ApiSuccessEnvelope & {
  request?: VerificationRequestSummary;
  verificationRequest?: VerificationRequestSummary;
  doctor?: AdminDoctorDetailsDoctor | VerificationRequestChangesPayload;
};

/** Matches backend Complaint model (API-3.pdf). */
export type ComplaintType =
  | "appointment"
  | "consultation"
  | "access_request"
  | "technical"
  | "other";

export type ComplaintLifecycleStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "closed";

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

export type ComplaintAttachmentDownloadUrlResponse = ApiSuccessEnvelope & {
  complaintId?: string;
  fileId?: string;
  label?: string;
  originalName?: string;
  mimeType?: string;
  url?: string;
  downloadUrl?: string;
  expiresIn?: number;
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

export type AdminUserReboardResponse = ApiSuccessEnvelope & {
  userId?: string;
  role?: string;
};

export type AdminDoctorRestoreRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | string;

export type AdminDoctorRestoreRequestSummary = {
  _id?: string;
  id?: string;
  status?: AdminDoctorRestoreRequestStatus;
  reviewNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
  recoverUntil?: string | null;
  user?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  doctor?: {
    _id?: string;
    specialization?: string;
    user?: {
      _id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
    };
  };
};

export type AdminDoctorRestoreRequestsListResponse = ApiSuccessEnvelope & {
  restoreRequests?: AdminDoctorRestoreRequestSummary[];
  results?: number | AdminDoctorRestoreRequestSummary[];
  items?: AdminDoctorRestoreRequestSummary[];
  page?: number;
  limit?: number;
  total?: number;
};

export type AdminDoctorRestoreRequestReviewResponse = ApiSuccessEnvelope & {
  restoreRequest?: AdminDoctorRestoreRequestSummary;
  user?: AdminUserSummary;
  doctor?: AdminDoctorSummary;
};

export type AdminUserSummary = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type AdminUsersListResponse = ApiSuccessEnvelope & {
  users: AdminUserSummary[];
};

export type CreateAdminUserBody = {
  fullName: string;
  email: string;
  password: string;
  role: "data_entry" | string;
  phoneNumber: string;
};

export type CreateAdminUserResponse = ApiSuccessEnvelope & {
  user?: AdminUserSummary;
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
  specializationKey?: string | null;
  customSpecializationText?: string | null;
  customSpecializationPending?: boolean;
  customSpecializationStatus?: string | null;
  medicalLicenseNumber?: string;
  education?: string;
  bio?: string;
  clinicAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  consultationFee?: number;
  consultationTypes?: Array<"online" | "offline" | string>;
  clinicLocation?: {
    type?: "Point";
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
  /** قد يكون معرفاً فقط؛ أو كائناً معبأً بحقوق المستخدم كما في طلب التحقق. */
  userId?:
    | string
    | {
        _id?: string;
        fullName?: string;
        email?: string;
        phone?: string;
        gender?: string;
        photoUrl?: string;
        dateOfBirth?: string;
        accountDeletionStatus?: string;
        accountDeletion?: { status?: string | null } | null;
      };
  accountDeletionStatus?: string;
  accountDeletion?: { status?: string | null } | null;
  /**
   * بعض الردود تعيد بيانات الحساب في جذر المستند بدل `user` — ندمجها للعرض في `user`.
   */
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  photoUrl?: string;
  /** أسماء بديلة محتملة من الـ API */
  birthDate?: string;
  /** إن خزّن الباكند معرف طلب التحقق على ملف الطبيب مباشرةً */
  pendingVerificationRequestId?: string;
  /** من قائمة/تفاصيل الأطباء عندما يعيدها الـ API */
  averageRating?: number;
  totalReviews?: number;
};

export type AdminDoctorDetailsResponse = ApiSuccessEnvelope & {
  doctor: AdminDoctorDetailsDoctor;
  /** إن ردّ الباكند طلب التحقق المرتبط (API-3.pdf) نستخدمه مباشرةً دون الاعتماد على القائمة فقط. */
  verificationRequest?: VerificationRequestSummary | null;
  /** أحياناً يُرجع الباكند المعرف في جذر الرد بدل تضمين كائن الطلب كاملاً */
  pendingVerificationRequestId?: string;
};

/** GET /api/admin/doctors/:id/analytics/* — day | week | month | year (API-3) */
export type AdminDoctorAnalyticsRange = "day" | "week" | "month" | "year";

export type AdminDoctorAnalyticsQuery = {
  range?: AdminDoctorAnalyticsRange;
  from?: string;
  to?: string;
};

export type DiagnosisChartItem = { label: string; value: number };

/**
 * شكل رد GET /api/doctors/analytics/diagnosis (و GET /api/admin/doctors/:id/.../diagnosis) — API-3.
 */
export type DoctorDiagnosisAnalyticsResponse = ApiSuccessEnvelope & {
  range?: string;
  from?: string;
  to?: string;
  series?: Array<{ periodStart: string; count: number }>;
  total?: number;
};

/**
 * شكل رد GET /api/doctors/analytics/summary — API-3.
 */
export type DoctorActivitySummaryResponse = ApiSuccessEnvelope & {
  range?: string;
  from?: string;
  to?: string;
  series?: Array<{
    periodStart: string;
    consultations?: number;
    ordersCreated?: number;
    accessRequests?: number;
    medicalRecords?: number;
    appointmentsCompleted?: number;
    appointmentsNoShow?: number;
    newLinkedPatients?: number;
  }>;
  totals?: {
    consultations?: number;
    ordersCreated?: number;
    accessRequests?: number;
    medicalRecords?: number;
    appointmentsCompleted?: number;
    appointmentsNoShow?: number;
    newLinkedPatients?: number;
  };
};

/**
 * عرض لوحة الإدارة: أربعة أرقام رئيسية + متوسط التقييم من ملف الطبيب عند التوافر.
 * visits = appointmentsCompleted، diagnoses = medicalRecords (حسب الـ API).
 */
export type DoctorSummaryStats = {
  patients: number;
  visits: number;
  diagnoses: number;
  ratings: number;
  averageRating: number;
};

export type AdminContentType =
  | "CONDITION"
  | "SYMPTOM"
  | "GENERAL_ADVICE"
  | "NEWS"
  | "MEDICATION"
  | "SETTINGS_PAGE";

export type AdminContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export type AdminContentListParams = {
  type?: AdminContentType;
  status?: AdminContentStatus;
  language?: "ar" | "en";
  page?: number;
  limit?: number;
};

export type AdminContentItem = {
  _id: string;
  type: AdminContentType;
  status: AdminContentStatus;
  /** Plain string for most types; `{ ar, en }` for SETTINGS_PAGE per API-3. */
  title?: AdminLocalizedValue;
  summary?: string;
  language?: string;
  slug?: string;
  pageVersion?: string | null;
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
  | { type: "heading"; level?: number; text?: string }
  | { type: "paragraph"; text?: string }
  | { type: "list"; items?: string[]; ordered?: boolean }
  | {
      type: "callout";
      variant?: "info" | "warn" | "danger";
      title?: string;
      text?: string;
    }
  | {
      type: "linkCard";
      title?: string;
      url?: string;
      description?: string;
    }
  | {
      type: "faq";
      items?: Array<{ question?: string; answer?: string }>;
    }
  | { type: "divider" }
  | { type: string; [key: string]: unknown };

export type AdminLocalizedValue = string | { ar?: string; en?: string };

export type AdminContentDynamicValue =
  | string
  | number
  | boolean
  | null
  | AdminLocalizedValue
  | AdminContentDynamicRecord
  | AdminContentDynamicValue[];

export type AdminContentDynamicRecord = {
  [key: string]: AdminContentDynamicValue;
};

export type AdminContentSource = {
  title?: AdminLocalizedValue;
  url?: string;
};

export type AdminContentNews = {
  sourceName?: string;
  sourceUrl?: string;
  originalTitle?: string;
  publishedAt?: string;
  aiSummary?: string;
  dedupeHash?: string;
  importedAt?: string;
};

export type AdminContentDetailsItem = AdminContentItem & {
  contentBlocks?: AdminContentBlock[];
  tags?: string[];
  categories?: string[];
  riskFlags?: string[];
  relatedContentIds?: string[];
  sources?: AdminContentSource[];
  news?: AdminContentNews | null;
  sourceName?: string;
  sourceUrl?: string;
  originalTitle?: string;
  publishedAt?: string;
  aiSummary?: string;
  coverImage?: string;
  pageVersion?: string | null;
  disclaimerVersion?: number | string;
  requiresSeekHelpBlock?: boolean;
  isFeatured?: boolean;
  rejectionReason?: string | null;
  templateId?: string | null;
  data?: AdminContentDynamicRecord | AdminContentDynamicValue[] | null;
  template?: AdminContentTemplate | null;
  contentTemplate?: AdminContentTemplate | null;
  templateDefinition?: AdminContentTemplate | null;
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
  /** Plain string for most types; `{ ar, en }` for SETTINGS_PAGE per API-3. */
  title: AdminLocalizedValue;
  summary?: string;
  language: "ar" | "en";
  slug?: string;
  coverImage?: string;
  pageVersion?: string | null;
  status?: AdminContentStatus;
  templateId?: string | null;
  data?: AdminContentDynamicRecord | AdminContentDynamicValue[] | null;
  contentBlocks?: AdminContentBlock[];
  tags?: string[];
  categories?: string[];
  riskFlags?: string[];
  relatedContentIds?: string[];
  isFeatured?: boolean;
  disclaimerVersion?: number | string;
  requiresSeekHelpBlock?: boolean;
  sources?: AdminContentSource[];
  news?: AdminContentNews | null;
  sourceName?: string;
  sourceUrl?: string;
  originalTitle?: string;
  publishedAt?: string;
  aiSummary?: string;
};

export type UpdateAdminContentBody = Partial<CreateAdminContentBody> & {
  status?: AdminContentStatus;
  /** إصدار الصفحة — مطلوب فعلياً لاعتماد SETTINGS_PAGE (راجع API-3). */
  pageVersion?: string | null;
};

export type AdminContentMutationResponse = ApiSuccessEnvelope & {
  item?: AdminContentDetailsItem;
  content?: AdminContentDetailsItem;
  contentItem?: AdminContentDetailsItem;
  data?: AdminContentDetailsItem;
};

export type AdminContentReviewActionResponse = ApiSuccessEnvelope & {
  item?: AdminContentDetailsItem;
  content?: AdminContentDetailsItem;
  contentItem?: AdminContentDetailsItem;
  data?: AdminContentDetailsItem;
};

/** فئات كتالوج الطلبات الطبية (تحاليل / أشعة / إجراءات / تحويلات) */
export type MedicalOrderCatalogKind =
  | "lab"
  | "imaging"
  | "procedure"
  | "referral";

export type MedicalOrderCatalogItem = {
  _id: string;
  label: string;
  code?: string;
  shortCode?: string;
  nameAr?: string;
  nameEn?: string;
  category?: string;
  synonyms?: string[];
  priorityLevel?: "low" | "normal" | "high" | "critical" | string;
  sortOrder?: number;
  isActive?: boolean;
  isVisible?: boolean;
  // LAB
  loincCode?: string;
  sampleType?: string;
  fastingRequired?: boolean;
  resultType?: string;
  // IMAGING
  modality?: string;
  bodyArea?: string;
  supportsContrast?: boolean;
  // PROCEDURE
  defaultPreparation?: string;
  defaultAftercare?: string;
  // COMMON
  notes?: string;
};

export type AdminMedicalOrderCatalogListParams = {
  type: MedicalOrderCatalogKind;
  search?: string;
  q?: string;
  category?: string;
  priorityLevel?: "low" | "normal" | "high" | "critical" | string;
  isActive?: boolean;
  isVisible?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
};

export type AdminMedicalOrderCatalogListResponse = ApiSuccessEnvelope & {
  items?: MedicalOrderCatalogItem[];
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
};

export type AdminMedicalOrderCatalogUpsertBody = {
  kind: MedicalOrderCatalogKind;
  label?: string;
  code?: string;
  shortCode?: string;
  nameAr?: string;
  nameEn?: string;
  category?: string;
  synonyms?: string[];
  priorityLevel?: "low" | "normal" | "high" | "critical" | string;
  sortOrder?: number;
  isActive?: boolean;
  isVisible?: boolean;
  // LAB
  loincCode?: string;
  sampleType?: string;
  fastingRequired?: boolean;
  resultType?: string;
  // IMAGING
  modality?: string;
  bodyArea?: string;
  supportsContrast?: boolean;
  // PROCEDURE
  defaultPreparation?: string;
  defaultAftercare?: string;
  // COMMON
  notes?: string;
};

export type AdminMedicalOrderCatalogMutationResponse = ApiSuccessEnvelope & {
  item?: MedicalOrderCatalogItem;
};

export type AdminMedicalOrderCatalogDetailsResponse = ApiSuccessEnvelope & {
  item?: MedicalOrderCatalogItem & {
    isActive?: boolean;
    isVisible?: boolean;
  };
};

/** أنواع المحتوى الأب المسموحة لقالب البيانات (API-3: parentType). */
export type AdminContentTemplateParentType =
  | "CONDITION"
  | "SYMPTOM"
  | "GENERAL_ADVICE"
  | "MEDICATION";

/** أنواع حقول القالب المعروضة في محرّر الحقول. */
/** Matches ContentTemplateField.type in docs/openapi.json exactly — the backend
 * has no `text`/`textarea`/`date`/`select` field types. */
export type AdminContentTemplateFieldType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object";

export type AdminContentTemplateField = {
  key: string;
  label?: AdminLocalizedValue;
  type?: AdminContentTemplateFieldType | string;
  required?: boolean;
  enum?: unknown[];
  min?: number;
  max?: number;
  regex?: string;
  isPublic?: boolean;
};

export type AdminContentTemplate = {
  _id: string;
  /** Matches `LocalizedInput` in docs/openapi.json — string or `{ar?, en?}`. */
  name?: AdminLocalizedValue;
  slug?: string;
  description?: string;
  parentType?: AdminContentTemplateParentType | string;
  isActive?: boolean;
  active?: boolean;
  schemaVersion?: number;
  fields?: AdminContentTemplateField[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminContentTemplatesListParams = {
  parentType?: AdminContentTemplateParentType;
  active?: boolean;
  page?: number;
  limit?: number;
};

export type AdminContentTemplatesListResponse = ApiSuccessEnvelope & {
  items?: AdminContentTemplate[];
  templates?: AdminContentTemplate[];
  contentTemplates?: AdminContentTemplate[];
  total?: number;
  page?: number;
  limit?: number;
  results?: number;
};

export type CreateAdminContentTemplateBody = {
  /** Matches `LocalizedInput` in docs/openapi.json — string or `{ar?, en?}`. */
  name: AdminLocalizedValue;
  slug?: string;
  parentType: AdminContentTemplateParentType;
  fields?: AdminContentTemplateField[];
};

export type UpdateAdminContentTemplateBody =
  Partial<CreateAdminContentTemplateBody>;

export type AdminContentTemplateMutationResponse = ApiSuccessEnvelope & {
  item?: AdminContentTemplate;
  template?: AdminContentTemplate;
};

export type AdminContentTemplateDisableResponse = ApiSuccessEnvelope & {
  item?: AdminContentTemplate;
  template?: AdminContentTemplate;
};

export type AdminNewsItem = {
  _id?: string;
  sourceUrl: string;
  publishedAt?: string;
  title: string;
  summary?: string;
  language?: "ar" | "en" | string;
  sourceName?: string;
  originalTitle?: string;
  aiSummary?: string;
  coverImage?: string;
  rawPayload?: unknown;
};

export type AdminNewsIngestBody = {
  items: AdminNewsItem[];
};

export type AdminNewsPendingListParams = {
  page?: number;
  limit?: number;
  sourceUrl?: string;
  language?: "ar" | "en";
  dateFrom?: string;
  dateTo?: string;
};

export type AdminNewsPendingListResponse = ApiSuccessEnvelope & {
  items?: AdminContentDetailsItem[];
  content?: AdminContentDetailsItem[];
  total?: number;
  page?: number;
  limit?: number;
};

export type AdminNewsIngestResponse = ApiSuccessEnvelope & {
  data?: { id?: string };
};

/** مجالات الكتالوج الموثّقة في API-3 لـ GET /admin/lookups */
export type AdminLookupCategoryDoc =
  | "BLOOD_TYPE"
  | "ALLERGY"
  | "MEDICAL_CONDITION";

/**
 * كتالوج تخصصات الطبيب عبر Lookups؛ حسب المرجع: `DOCTOR_SPECIALIZATION` يحدد هذا الجدول
 * ومسار الجمهور `GET /api/meta/doctor-specializations` يعيد خيارات **هذه الفئة فقط**.
 * قد يبقى `SPECIALIZATION` لبيئات أو نسخ سابقة من الخادم.
 */
export type AdminLookupDoctorSpecialtyCategory =
  | "SPECIALIZATION"
  | "DOCTOR_SPECIALIZATION";

export type AdminLookupCategory =
  | AdminLookupCategoryDoc
  | AdminLookupDoctorSpecialtyCategory;

export type AdminLocalizedLookupText = string | { ar?: string; en?: string };

export type AdminLookupRecord = {
  _id: string;
  category: AdminLookupCategory;
  key: string;
  text: AdminLocalizedLookupText;
  order: number;
  isActive: boolean;
};

export type AdminLookupsListParams = {
  category: AdminLookupCategory;
  includeInactive?: boolean;
  /** إذا كان false يُعاد النص ثنائي اللغة في الحقل text حيثما ينطبق (API-3). */
  langOnly?: boolean;
};

export type AdminLookupsListResponse = ApiSuccessEnvelope & {
  results: number;
  lookups: AdminLookupRecord[];
};

/**
 * `GET /api/meta/health-profile-options` — fixed, read-only blood-type enum
 * plus active allergy/condition lookups. Blood Type is never managed through
 * `/admin/lookups` (no admin CRUD exists for it); this is its only source.
 * @see LMJ Health Backend API Reference — «Health Profile Lookup Options»
 */
export type HealthProfileOptionEntry = {
  id: string;
  key: string;
  text: AdminLocalizedLookupText;
  order: number;
};

export type HealthProfileOptionsResponse = ApiSuccessEnvelope & {
  bloodTypes: HealthProfileOptionEntry[];
  allergies: HealthProfileOptionEntry[];
  medicalConditions: HealthProfileOptionEntry[];
};

export type AdminLookupCreateBody = {
  category: AdminLookupCategory;
  key: string;
  text: AdminLocalizedLookupText;
  order?: number;
};

export type AdminLookupPatchBody = Partial<{
  key: string;
  text: AdminLocalizedLookupText;
  order: number;
  isActive: boolean;
}>;

export type AdminLookupMutationResponse = ApiSuccessEnvelope & {
  lookups?: AdminLookupRecord[];
  lookup?: AdminLookupRecord;
};

export type AdminLookupDeleteResponse = ApiSuccessEnvelope & {
  lookup?: AdminLookupRecord;
};

// ─────────────────────────────────────────────────────────────────────────────
// Facilities (admin catalogue)
// ─────────────────────────────────────────────────────────────────────────────

export type FacilityType =
  | "hospital"
  | "clinic"
  | "polyclinic"
  | "medical_center"
  | "laboratory"
  | "imaging_center"
  | "pharmacy"
  | "rehabilitation_center"
  | "dialysis_center"
  | "emergency_center"
  | "other";

export type FacilityStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "DELETED";

export type FacilitySummary = {
  id: string;
  _id?: string;
  name: string;
  normalizedName?: string;
  facilityType: FacilityType;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status: FacilityStatus;
  attributes: string[];
  ownerDoctorId?: string | null;
  owner?: {
    id?: string;
    _id?: string;
    fullName?: string;
    user?: {
      fullName?: string;
    };
  } | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  legacyProviderId?: string | null;
  doctorCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type FacilitiesListParams = {
  page?: number;
  limit?: number;
  q?: string;
  name?: string;
  facilityType?: FacilityType;
  status?: FacilityStatus;
  city?: string;
  hasDoctors?: boolean;
  ownerDoctorId?: string | null;
  attribute?: string;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "city"
    | "status"
    | "facilityType"
    | "doctorCount";
  sortOrder?: "asc" | "desc";
};

export type FacilitiesListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  facilities?: FacilitySummary[];
  items?: FacilitySummary[];
  data?: {
    facilities?: FacilitySummary[];
    items?: FacilitySummary[];
    page?: number;
    limit?: number;
    total?: number;
    results?: number;
  };
};

export type CreateFacilityBody = {
  name: string;
  facilityType: FacilityType;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status?: FacilityStatus;
  attributes?: string[];
  ownerDoctorId?: string | null;
};

export type UpdateFacilityBody = Partial<CreateFacilityBody>;

export type FacilityActionBody = {
  action: "approve" | "merge";
  targetFacilityId?: string;
  mergeToId?: string;
};

export type FacilityResponse = ApiSuccessEnvelope & {
  facility?: FacilitySummary;
  data?: FacilitySummary | { facility?: FacilitySummary };
};

export type FacilityStatusMutationResponse = ApiSuccessEnvelope & {
  facility?: FacilitySummary;
  data?: FacilitySummary | { facility?: FacilitySummary };
};

export type FacilityDeleteResponse = ApiSuccessEnvelope & {
  facility?: FacilitySummary;
};

export type FacilityCreateResponse = ApiSuccessEnvelope & {
  data?: { id: string };
};

export type FacilityUpdateResponse = ApiSuccessEnvelope & {
  facility?: FacilitySummary;
  data?: FacilitySummary | { facility?: FacilitySummary };
};

export type FacilityDoctorSummary = {
  id: string;
  _id?: string;
  specialization?: string;
  approvalStatus?: AdminDoctorApprovalStatus;
  isApproved?: boolean;
  facilityId?: string;
  user?: {
    id?: string;
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
  };
};

export type FacilityDoctorsListParams = {
  page?: number;
  limit?: number;
  q?: string;
  name?: string;
  specialty?: string;
  status?: "pending" | "approved" | "rejected";
  sortBy?: "createdAt" | "updatedAt" | "name" | "specialty" | "status";
  sortOrder?: "asc" | "desc";
};

export type FacilityDoctorsListResponse = ApiSuccessEnvelope & {
  facility?: {
    id: string;
    name?: string;
    facilityType?: FacilityType;
    city?: string;
    status?: FacilityStatus;
    doctorCount?: number;
  };
  page: number;
  limit: number;
  total: number;
  results: number;
  doctors?: FacilityDoctorSummary[];
  items?: FacilityDoctorSummary[];
  data?: {
    doctors?: FacilityDoctorSummary[];
    items?: FacilityDoctorSummary[];
    page?: number;
    limit?: number;
    total?: number;
    results?: number;
    facility?: FacilityDoctorsListResponse["facility"];
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Types (dynamic schema-as-data)
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceTypeField = {
  key: string;
  label: string | { en: string; ar: string };
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  isPublic?: boolean;
  /** Allowed values for this field. Backend accepts any[]; UI treats entries as strings. */
  enum?: unknown[];
  min?: number;
  max?: number;
  regex?: string;
};

export type ServiceType = {
  _id: string;
  name: string | { en: string; ar: string };
  slug: string;
  description?: string | { en: string; ar: string };
  schemaVersion: number;
  isActive: boolean;
  fields: ServiceTypeField[];
};

/** Helper: extract display string from bilingual or plain string field */
export function resolveLabel(
  val: string | { en: string; ar: string } | undefined,
  lang: "ar" | "en" = "ar",
): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

export type ServiceTypesListResponse = {
  serviceTypes: ServiceType[];
};

export type CreateServiceTypeBody = {
  name: { en: string; ar: string };
  slug: string;
  description?: { en: string; ar: string };
  fields: ServiceTypeField[];
};

export type UpdateServiceTypeBody = Partial<CreateServiceTypeBody> & {
  /** مذكور في API-3 لـ PUT /service-types/:id */
  isActive?: boolean;
};

export type ServiceTypeResponse = {
  serviceType: ServiceType;
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Providers
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderStatus = "active" | "inactive" | "draft";

export type ServiceProviderPayload = {
  [key: string]: unknown;
};

export type ServiceProvider = {
  _id: string;
  id?: string;
  serviceType:
    | string
    | { id: string; slug: string; name: string | { en: string; ar: string } };
  status: ProviderStatus;
  schemaVersionAtWrite?: number;
  data: ServiceProviderPayload;
  createdAt?: string;
};

export type ServiceProvidersListResponse = {
  items: ServiceProvider[];
  limit: number;
  nextCursor: string | null;
};

export type ServiceProviderCreateResponse = ApiSuccessEnvelope & {
  data?: { id: string };
};

export type ServiceProviderUpdateResponse = ApiSuccessEnvelope & {
  provider?: ServiceProvider;
  item?: ServiceProvider;
  data?: ServiceProvider;
};

export type ServiceProviderStatusUpdateResponse = ApiSuccessEnvelope & {
  provider?: ServiceProvider;
  item?: ServiceProvider;
  data?: ServiceProvider;
};

export type DoctorProfileChangeRequestReviewResponse = ApiSuccessEnvelope & {
  request?: { status: string };
  doctor?: AdminDoctorDetailsDoctor | VerificationRequestChangesPayload;
};

export type CreateProviderBody = {
  serviceType: string;
  name: string;
  city?: string;
  country?: string;
  data?: ServiceProviderPayload;
  aliases?: string[];
  status?: string;
};

export type UpdateProviderBody = {
  data?: ServiceProviderPayload;
  status?: ProviderStatus;
};

// ─────────────────────────────────────────────────────────────────────────────
// Managed Service Providers — real management API shape (GET /api/service-providers,
// GET /api/service-providers/:id). Confirmed against the live backend OpenAPI spec;
// distinct from the legacy `ServiceProvider` type above, which mirrored the public
// /api/services catalog response and used `_id` instead of `id`.
// ─────────────────────────────────────────────────────────────────────────────

export type ManagedServiceTypeSummary = {
  id: string;
  name: string | { en: string; ar: string };
  slug: string;
  schemaVersion: number;
  isActive: boolean;
};

export type ManagedServiceProvider = {
  id: string;
  serviceType: ManagedServiceTypeSummary;
  name: string | null;
  city: string | null;
  country: string | null;
  aliases: string[];
  data: ServiceProviderPayload;
  status: ProviderStatus;
  schemaVersionAtWrite: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ManagedServiceProviderListParams = {
  serviceType?: string;
  status?: ProviderStatus;
  q?: string;
  page?: number;
  limit?: number;
};

export type ManagedServiceProviderListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  providers: ManagedServiceProvider[];
};

export type ManagedServiceProviderDetailResponse = ApiSuccessEnvelope & {
  provider: ManagedServiceProvider;
  /** Full localized service-type definition including dynamic field metadata. */
  serviceType: ServiceType;
};
