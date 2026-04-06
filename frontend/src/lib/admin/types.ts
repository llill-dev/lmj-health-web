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
  user: {
    fullName: string;
    email?: string;
    phone?: string;
    accountStatus: PatientAccountStatus;
    mustChangePassword?: boolean;
  };
  isClaimed?: boolean;
  claimedAt?: string | null;
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
