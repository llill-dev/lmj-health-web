export type WaitlistStatus =
  | 'active'
  | 'contacted'
  | 'booked'
  | 'closed'
  | 'cancelled'
  | 'expired';

export type WaitlistUrgency = 'low' | 'medium' | 'high';

export type WaitlistTimeWindow = {
  startTime?: string;
  endTime?: string;
};

export type WaitlistPatientSummary = {
  _id?: string;
  publicId?: string;
  userId?: { fullName?: string; email?: string; phone?: string };
};

export type WaitlistRequest = {
  _id: string;
  status?: WaitlistStatus | string;
  urgencyLevel?: WaitlistUrgency | string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  preferredTimeWindows?: WaitlistTimeWindow[];
  contactPreference?: string;
  reason?: string;
  contactAttempts?: number;
  lastContactedAt?: string;
  appointment?: string | { _id?: string } | null;
  patient?: WaitlistPatientSummary | string;
  createdAt?: string;
  updatedAt?: string;
};

export type WaitlistListParams = {
  status?: WaitlistStatus | string;
  urgencyLevel?: WaitlistUrgency | string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type WaitlistListResponse = {
  messageKey?: string;
  message?: string;
  waitlistRequests?: WaitlistRequest[];
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
};

export type WaitlistDetailResponse = {
  messageKey?: string;
  message?: string;
  waitlistRequest?: WaitlistRequest;
};

export type CreateWaitlistRequestBody = {
  patientId?: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  preferredTimeWindows?: WaitlistTimeWindow[];
  urgencyLevel?: WaitlistUrgency | string;
  contactPreference?: string;
  reason?: string;
  notes?: string;
};

export type CreateWaitlistRequestResponse = {
  messageKey?: string;
  message?: string;
  waitlistRequest?: WaitlistRequest;
};

export type WaitlistBookBody = {
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  notes?: string;
};

export type WaitlistBookResponse = {
  messageKey?: string;
  message?: string;
  appointment?: { _id?: string; appointmentTypeNameSnapshot?: string };
  waitlistRequest?: WaitlistRequest;
};

export type WaitlistSuggestionsParams = {
  date: string;
  startTime?: string;
  type?: 'freeSlots' | 'slotCandidates';
};

export type WaitlistFreeSlot = {
  startTime?: string;
  endTime?: string;
};

export type WaitlistSlotCandidate = {
  id?: string;
  urgencyLevel?: WaitlistUrgency | string;
  patientName?: string;
  patientPublicId?: string;
  patientId?: string;
  status?: WaitlistStatus | string;
  preferredTimeWindows?: Array<{ from?: string; to?: string }>;
};

export type WaitlistSuggestionsResponse = {
  type?: 'freeSlots' | 'slotCandidates';
  date?: string;
  doctorId?: string;
  freeSlots?: WaitlistFreeSlot[];
  suggestionsBySlot?: Array<{
    startTime?: string;
    endTime?: string;
    candidates?: WaitlistSlotCandidate[];
  }>;
};
