export type DoctorPatientAccountStatus =
  | 'active'
  | 'temporary'
  | 'suspended'
  | 'all';

export type DoctorPatientsListParams = {
  name?: string;
  search?: string;
  diagnosis?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  account_status?: DoctorPatientAccountStatus;
};

export type DoctorPatientListItem = {
  _id: string;
  publicId: string;
  user: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    accountStatus?: Exclude<DoctorPatientAccountStatus, 'all'>;
  };
  allergies: string[];
  medicalConditions: string[];
  bloodType: string | null;
  lastVisitAt: string | null;
  isTemporary?: boolean;
};

export type DoctorPatientsListResponse = {
  messageKey?: string;
  message?: string;
  page: number;
  limit: number;
  total: number;
  results: number;
  patients: DoctorPatientListItem[];
};

export type DoctorPatientPublicProfile = {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  allergies?: string[];
  medicalConditions?: string[];
  bloodType?: string | null;
  heightCm?: number;
  weightKg?: number;
  measurementUnit?: 'metric' | 'imperial' | string;
};

export type DoctorPatientPublicProfileResponse = {
  messageKey?: string;
  message?: string;
  patient: DoctorPatientPublicProfile;
};

export type DoctorPatientMedicalRecord = {
  _id: string;
  title?: string;
  diagnosis?: string;
  prescriptions?: string[];
  attachments?: string[];
  followUpRequired?: boolean;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorPatientMedication = {
  _id?: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  sourceType?: string;
  remindersEnabled?: boolean;
};

export type DoctorPatientFile = {
  _id: string;
  id?: string;
  patientId?: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  isArchived?: boolean;
  createdAt?: string;
  note?: string;
  tags?: string[];
};

export type DoctorPatientOrder = {
  _id?: string;
  orderType?: string;
  type?: string;
  category?: string;
  orderTitle?: string;
  orderName?: string;
  statusCode?: string;
  status?: string;
  createdAt?: string;
};

export type DoctorPatientFullProfile = {
  _id: string;
  patientId?: string;
  allowDoctorsViewProfile?: boolean;
  heightCm?: number;
  weightKg?: number;
  measurementUnit?: string;
  bloodType?: string | null;
  dateOfBirth?: string;
  age?: number;
  bmi?: number;
  allergies?: string[];
  medicalConditions?: string[];
  user: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    photoUrl?: string | null;
  };
  medicalHistory?: DoctorPatientMedicalRecord[];
  files?: DoctorPatientFile[];
  medications?: DoctorPatientMedication[];
  orders?: DoctorPatientOrder[];
};

export type DoctorPatientFullProfileResponse = {
  messageKey?: string;
  message?: string;
  patient: DoctorPatientFullProfile;
};

export type DoctorPatientAccessRequestBody = {
  reason: string;
  items?: Array<{
    type?: string;
    refId?: string;
    description?: string;
  }>;
  expiresAt?: string;
};

export type DoctorPatientAccessRequestResponse = {
  messageKey?: string;
  message?: string;
  accessAlreadyAllowed?: boolean;
  pendingRequestId?: string | null;
  request: {
    _id: string;
    status: string;
    scope?: string;
    reason?: string;
    createdAt?: string;
    updatedAt?: string;
    decidedAt?: string | null;
    expiresAt?: string | null;
    requestedItems?: Array<{
      type?: string;
      refId?: string;
      description?: string;
    }>;
  } | null;
};

export type CreateTemporaryPatientBody = {
  fullName: string;
  email: string;
  phone: string;
};

export type CreateTemporaryPatientResponse = {
  messageKey?: string;
  message?: string;
  patientId: string;
  userId: string;
  accountStatus: 'temporary' | 'active' | 'suspended';
  isTemporary?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointments
// ─────────────────────────────────────────────────────────────────────────────

export type DoctorAppointmentStatus =
  | 'scheduled'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type DoctorAppointmentListParams = {
  page?: number;
  limit?: number;
  status?: DoctorAppointmentStatus;
  date?: string;
};

export type DoctorAppointmentSummary = {
  _id: string;
  doctor?: {
    _id: string;
    specialization?: string;
    userId?: { _id?: string; fullName?: string };
  };
  patient?: {
    _id: string;
    publicId?: string;
    userId?: { _id?: string; fullName?: string };
  };
  status: DoctorAppointmentStatus;
  date?: string;
  startTime?: string;
  startDateTime?: string;
  endTime?: string;
  notes?: string;
  appointmentType?: string | null;
  appointmentTypeNameSnapshot?: string | null;
  priceSnapshot?: number | null;
  priceVisibleToPatientSnapshot?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  rescheduledAt?: string;
  rescheduledBy?: string;
  rescheduleReason?: string;
  completedAt?: string;
  noShowAt?: string;
};

export type DoctorAppointmentFile = {
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
};

export type DoctorAppointmentDetailsResponse = {
  messageKey?: string;
  message?: string;
  appointment: DoctorAppointmentSummary;
  files?: DoctorAppointmentFile[];
};

export type DoctorAppointmentsListResponse = {
  messageKey?: string;
  message?: string;
  page: number;
  limit: number;
  total: number;
  results: number;
  appointments: DoctorAppointmentSummary[];
};

export type DoctorBookAppointmentBody = {
  doctorId: string;
  patientId?: string;
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  notes?: string;
};

export type DoctorAppointmentMutationResponse = {
  messageKey?: string;
  message?: string;
  appointment: DoctorAppointmentSummary;
};

export type DoctorCancelAppointmentBody = {
  reason: string;
};

export type DoctorRescheduleAppointmentBody = {
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  reason?: string;
};

export type DoctorCompleteAppointmentBody = {
  notes: string;
};

export type DoctorNoShowAppointmentBody = {
  reason: string;
};
