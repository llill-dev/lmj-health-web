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
  times?: string[];
};

export type AddDoctorPatientMedicationBody = {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  times?: string[];
  remindersEnabled?: boolean;
  notes?: string;
};

export type AddDoctorPatientMedicationResponse = {
  message?: string;
  messageKey?: string;
  medication?: DoctorPatientMedication & { _id?: string };
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

export type DoctorPatientFilesListParams = {
  page?: number;
  limit?: number;
  archived?: boolean;
  search?: string;
  category?: string;
  subcategory?: string;
  mimeCategory?: string;
  clinicalContext?: string;
  sourceModule?: string;
  uploadedByRole?: string;
  visibilityScope?: string;
  appointmentId?: string;
  tags?: string[];
  serviceDateFrom?: string;
  serviceDateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type DoctorPatientFilesListResponse = {
  messageKey?: string;
  message?: string;
  items?: DoctorPatientFile[];
  files?: DoctorPatientFile[];
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  pageInfo?: {
    page?: number;
    limit?: number;
    total?: number;
    results?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
};

export type DoctorPatientFileDetailsResponse = {
  messageKey?: string;
  message?: string;
  file: DoctorPatientFile;
};

export type DoctorFileDownloadUrlResponse = {
  messageKey?: string;
  message?: string;
  fileId?: string;
  fileName?: string;
  mimeType?: string | null;
  extension?: string | null;
  url?: string;
  downloadUrl?: string;
  expiresIn?: number;
};

export type DoctorPatientFileDeleteResponse = {
  messageKey?: string;
  message?: string;
  success?: boolean;
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

export type DoctorPatientLinkResponse = {
  messageKey?: string;
  message?: string;
  doctorId?: string;
  patientId?: string;
};

export type DoctorAccessRequestStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'rejected'
  | 'expired';

export type DoctorAccessRequestListParams = {
  status?: DoctorAccessRequestStatus;
  patientId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type DoctorAccessRequestListItem = {
  _id: string;
  scope?: string;
  status: DoctorAccessRequestStatus | string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
  decidedAt?: string | null;
  expiresAt?: string | null;
  requestedItems?: Array<{
    type?: string;
    refId?: string;
    description?: string;
  }>;
  requester?: {
    _id?: string;
    specialization?: string;
    userId?: {
      _id?: string;
      fullName?: string;
      photoUrl?: string | null;
    };
    user?: {
      _id?: string;
      fullName?: string;
      photoUrl?: string | null;
    };
  };
  patient?: {
    _id?: string;
    publicId?: string;
    userId?: {
      _id?: string;
      fullName?: string;
      photoUrl?: string | null;
    };
    user?: {
      _id?: string;
      fullName?: string;
      photoUrl?: string | null;
    };
  };
};

export type DoctorAccessRequestsListResponse = {
  messageKey?: string;
  message?: string;
  page: number;
  limit: number;
  total: number;
  results: number;
  requests: DoctorAccessRequestListItem[];
};

export type DoctorAccessRequestDetailsResponse = {
  messageKey?: string;
  message?: string;
  request: DoctorAccessRequestListItem;
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

export type LinkExistingDoctorPatientResponse = {
  messageKey?: string;
  message?: string;
  doctorId: string;
  patientId: string;
};

export type DoctorMedicalRecordsListResponse = {
  messageKey?: string;
  message?: string;
  records: DoctorPatientMedicalRecord[];
};

export type DoctorMedicalRecordDetailsResponse = {
  messageKey?: string;
  message?: string;
  record: DoctorPatientMedicalRecord;
};

export type DoctorCreateMedicalRecordBody = {
  title: string;
  diagnosis: string;
  prescriptions?: string[];
  attachments?: string[];
  followUpRequired?: boolean;
};

export type DoctorUpdateMedicalRecordBody = Partial<DoctorCreateMedicalRecordBody>;

export type DoctorEncounterStatus = 'open' | 'closed';

export type DoctorEncounterOrigin =
  | 'appointment'
  | 'walk_in'
  | 'manual'
  | 'follow_up'
  | string;

export type DoctorPatientEncountersListParams = {
  status?: DoctorEncounterStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'startedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type DoctorEncountersListParams = DoctorPatientEncountersListParams & {
  patientId?: string;
};

export type DoctorEncounterPatientSummary = {
  _id?: string;
  publicId?: string;
  dateOfBirth?: string;
  age?: number;
  user?: {
    _id?: string;
    fullName?: string;
    dateOfBirth?: string;
  };
};

export type DoctorEncounterSummary = {
  _id: string;
  status?: DoctorEncounterStatus | string;
  origin?: DoctorEncounterOrigin;
  notes?: string;
  startedAt?: string;
  createdAt?: string;
  closedAt?: string | null;
  patient?: DoctorEncounterPatientSummary;
  doctor?: {
    _id?: string;
    user?: { fullName?: string };
  };
  appointment?: {
    _id?: string;
    date?: string;
    startTime?: string;
    status?: string;
    appointmentType?: string | null;
    appointmentTypeNameSnapshot?: string | null;
  } | null;
};

export type DoctorCreateEncounterBody = {
  appointmentId?: string;
  origin?: DoctorEncounterOrigin;
  notes?: string;
};

export type DoctorUpdateEncounterBody = Partial<DoctorCreateEncounterBody>;

export type DoctorPatientEncountersListResponse = {
  messageKey?: string;
  message?: string;
  page: number;
  limit: number;
  total: number;
  results: number;
  encounters: DoctorEncounterSummary[];
};

export type DoctorEncounterDetailsResponse = {
  messageKey?: string;
  message?: string;
  encounter: DoctorEncounterSummary;
};

export type DoctorCloseEncounterResponse = {
  messageKey?: string;
  message?: string;
  encounterId: string;
  status: DoctorEncounterStatus | string;
  closedAt?: string | null;
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
  /** Single local day (YYYY-MM-DD). Mutually exclusive with dateFrom/dateTo. */
  date?: string;
  /** Inclusive range start (YYYY-MM-DD). API: dateFrom */
  dateFrom?: string;
  /** Inclusive range end (YYYY-MM-DD). API: dateTo */
  dateTo?: string;
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

export type DoctorAppointmentFilesListResponse = {
  messageKey?: string;
  message?: string;
  items: DoctorAppointmentFile[];
};

export type DoctorAppointmentFileDetailsResponse = {
  messageKey?: string;
  message?: string;
  file: DoctorAppointmentFile;
};

export type DoctorAppointmentFileUploadResponse = {
  messageKey?: string;
  message?: string;
  file: DoctorAppointmentFile;
};

export type DoctorAppointmentFileDeleteResponse = {
  messageKey?: string;
  message?: string;
  success?: boolean;
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
  reason?: string;
};

export type DoctorRescheduleAppointmentBody = {
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  reason?: string;
};

export type DoctorCompleteAppointmentBody = {
  notes?: string;
};

export type DoctorNoShowAppointmentBody = {
  reason?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointment Types
// ─────────────────────────────────────────────────────────────────────────────

export type AppointmentType = {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  priceVisibleToPatient?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorAppointmentTypesResponse = {
  messageKey?: string;
  message?: string;
  appointmentTypes: AppointmentType[];
};

export type CreateAppointmentTypeBody = {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  priceVisibleToPatient?: boolean;
};

export type UpdateAppointmentTypeBody = {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  priceVisibleToPatient?: boolean;
  isActive?: boolean;
};

export type AppointmentTypeApiBody = {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isPriceVisibleToPatient?: boolean;
  isActive?: boolean;
};

export type AppointmentTypeMutationResponse = {
  messageKey?: string;
  message?: string;
  appointmentType: AppointmentType;
};

export type DoctorActionResponse = {
  messageKey?: string;
  message?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Schedule (based on actual API)
// ─────────────────────────────────────────────────────────────────────────────

// Day names used by API
export type ScheduleDayKey =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

// Time slot for a day
export interface ScheduleTimeSlot {
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "12:00"
}

// Available times for one day (e.g., Monday)
export interface ScheduleDayTemplate {
  day: ScheduleDayKey;
  slots: ScheduleTimeSlot[];
}

// Exception for a specific date
export interface ScheduleException {
  _id?: string;
  date: string; // YYYY-MM-DD
  slots: ScheduleTimeSlot[];
  note?: string;
}

// Slot settings (doctor-level)
export interface ScheduleSlotSettings {
  duration: number; // minutes (e.g., 30)
  gap: number;      // minutes (e.g., 5)
}

// Full schedule response from GET /doctors/:doctorId/schedule
export interface DoctorScheduleResponse {
  messageKey?: string;
  message?: string;
  availableTimes: ScheduleDayTemplate[];
  exceptions: ScheduleException[];
  slotSettings: ScheduleSlotSettings;
}

// Body for PUT /doctors/:doctorId/schedule (full replacement)
export interface DoctorUpdateScheduleBody {
  availableTimes: ScheduleDayTemplate[];
  exceptions: ScheduleException[];
}

// Body for PATCH /doctors/:doctorId/schedule/settings
export interface DoctorUpdateScheduleSettingsBody {
  duration?: number;
  gap?: number;
}

// Body for POST /doctors/:doctorId/schedule/day
export interface DoctorAddDayBody {
  day: ScheduleDayKey;
  slots: ScheduleTimeSlot[];
}

// Body for PATCH /doctors/:doctorId/schedule/day/:day
export interface DoctorUpdateDayBody {
  slots: ScheduleTimeSlot[];
}

// Body for POST /doctors/:doctorId/schedule/exception
export interface DoctorAddExceptionBody {
  date: string; // YYYY-MM-DD
  slots: ScheduleTimeSlot[];
  note?: string;
}

// Body for PATCH /doctors/:doctorId/schedule/exceptions (replace all)
export interface DoctorUpdateExceptionsBody {
  exceptions: ScheduleException[];
}

// Free slots response from GET /doctors/:doctorId/slots?type=free
export interface DoctorFreeSlotsResponse {
  messageKey?: string;
  message?: string;
  date: string;
  doctorId: string;
  duration: number;
  gap: number;
  freeSlots: ScheduleTimeSlot[];
  totalFreeSlots: number;
}

// Booked slots response from GET /doctors/:doctorId/slots?type=booked
// NOTE: API returns "appointments" array with "totalBooked", not "bookedSlots"
export interface DoctorBookedSlotsResponse {
  messageKey?: string;
  message?: string;
  date: string;
  doctorId: string;
  appointments: Array<{
    _id: string;
    patient: string;
    startTime: string;
    endTime: string;
    patientName?: string;
    status?: string;
  }>;
  totalBooked: number;
}

// All slots response from GET /doctors/:doctorId/slots?type=all
// NOTE: The exact structure for type=all is not fully documented in API-3 extract.
// We assume it returns both free and booked data - adjust if API returns different structure
export interface DoctorAllSlotsResponse {
  messageKey?: string;
  message?: string;
  date: string;
  doctorId: string;
  duration?: number;
  gap?: number;
  // Support both free slots data
  freeSlots?: ScheduleTimeSlot[];
  totalFreeSlots?: number;
  // And booked appointments data (using API naming conventions)
  appointments?: Array<{
    _id: string;
    patient: string;
    startTime: string;
    endTime: string;
    patientName?: string;
    status?: string;
  }>;
  totalBooked?: number;
}

// Query params for GET /doctors/:doctorId/slots
export interface DoctorSlotsQueryParams {
  date: string; // YYYY-MM-DD (required)
  type?: 'free' | 'booked' | 'all'; // default: 'free'
  page?: number;
  limit?: number;
}
