export type DoctorOrderCategory = 'lab' | 'radiology' | 'procedure' | 'all';

export type DoctorOrdersListParams = {
  patientId?: string;
  orderType?: string;
  category?: string;
  type?: string;
  status?: string;
  statusCode?: string;
  q?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type DoctorOrderPatientRef = {
  _id?: string;
  publicId?: string;
  patientId?: string;
  user?: {
    fullName?: string;
    phone?: string;
  };
};

export type DoctorOrderResultAttachment = {
  _id?: string;
  title?: string;
  name?: string;
  fileName?: string;
  url?: string;
  downloadUrl?: string;
  mimeType?: string;
  reportText?: string;
  summary?: string;
};

export type DoctorOrderItem = {
  _id?: string;
  title?: string;
  name?: string;
  testName?: string;
  procedureName?: string;
};

export type DoctorOrderRecord = {
  _id: string;
  orderType?: string;
  type?: string;
  category?: string;
  orderTitle?: string;
  orderName?: string;
  status?: string;
  statusCode?: string;
  priority?: string;
  urgency?: string;
  createdAt?: string;
  updatedAt?: string;
  patientId?: string;
  encounterId?: string;
  patient?: DoctorOrderPatientRef;
  notes?: string;
  clinicalSummary?: string;
  clinicalReason?: string;
  instructionsToPatient?: string;
  labInstructions?: string;
  imagingCenterInstructions?: string;
  results?: DoctorOrderResultAttachment[];
  items?: DoctorOrderItem[];
};

export type UpdateDoctorOrderStatusBody = {
  statusCode?: string;
  status?: string;
};

export type CancelDoctorOrderBody = {
  note?: string;
};

export type DoctorOrderMutationResponse = {
  messageKey?: string;
  message?: string;
  order?: DoctorOrderRecord;
  orderId?: string;
  statusCode?: string;
  status?: string;
};

export type DoctorOrdersListResponse = {
  messageKey?: string;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  orders?: DoctorOrderRecord[];
};

export type DoctorOrderDetailsResponse = {
  messageKey?: string;
  message?: string;
  order: DoctorOrderRecord;
};
