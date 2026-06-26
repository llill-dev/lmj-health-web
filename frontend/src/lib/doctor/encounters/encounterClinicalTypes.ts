export type EncounterClinicalListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export type EncounterPrescriptionItem = {
  _id?: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: string | number;
  route?: string;
  instructions?: string;
  notes?: string;
};

export type EncounterPrescription = {
  _id: string;
  status?: string;
  encounterId?: string;
  generalInstructions?: string;
  notes?: string;
  items?: EncounterPrescriptionItem[];
  finalizedAt?: string;
};

export type EncounterPrescriptionsListResponse = {
  messageKey?: string;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  prescriptions?: EncounterPrescription[];
};

export type EncounterOrderItem = {
  _id?: string;
  title?: string;
  name?: string;
  testName?: string;
  procedureName?: string;
  notes?: string;
  catalogItemId?: string;
  displayName?: string;
  displayNameAr?: string;
  displayNameEn?: string;
  bodyPart?: string;
  bodyArea?: string;
  modality?: string;
  type?: string;
  category?: string;
  side?: string;
  position?: string;
  details?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export type EncounterOrder = {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  encounterId?: string;
  orderType?: string;
  type?: string;
  category?: string;
  orderTitle?: string;
  orderName?: string;
  status?: string;
  statusCode?: string;
  urgency?: string;
  priority?: string;
  urgencyLevel?: string;
  specialty?: string;
  referralType?: string;
  referredDoctorName?: string;
  institution?: string;
  clinicalSummary?: string;
  questionsToColleague?: string;
  clinicalReason?: string;
  reason?: string;
  notes?: string;
  items?: EncounterOrderItem[];
  itemCount?: number;
};

export type EncounterOrdersListResponse = {
  messageKey?: string;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  orders?: EncounterOrder[];
};

export type EncounterPrescriptionPreviewResponse = {
  messageKey?: string;
  message?: string;
  preview?: {
    downloadUrl?: string;
    pdfUrl?: string;
    url?: string;
    itemCount?: number;
    canFinalize?: boolean;
  };
};
