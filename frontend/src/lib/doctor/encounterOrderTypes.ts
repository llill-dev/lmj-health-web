import type { EncounterOrder, EncounterOrdersListResponse } from './encounterClinicalTypes';

export type ImagingOrderItemBody = {
  title?: string;
  name?: string;
  testName?: string;
  procedureName?: string;
  notes?: string;
  catalogItemId?: string;
  details?: {
    type?: string;
    bodyArea?: string;
    side?: string;
    position?: string;
    category?: string;
  };
};

export type EncounterOrderCatalogItemRef = {
  catalogItemId?: string;
  _id?: string;
  title?: string;
  name?: string;
  notes?: string;
  testName?: string;
  procedureName?: string;
  bodyPart?: string;
  modality?: string;
};

export type CreateEncounterOrderBody = {
  /** قيمة قديمة لـ POST /doctors/orders — احتياط عند رفض الجسم الفارغ */
  type?: string;
  patientId?: string;
  encounterId?: string;
  orderType?: string;
  catalogItems?: EncounterOrderCatalogItemRef[];
  manualItems?: EncounterOrderCatalogItemRef[];
  clinicalReason?: string;
  urgency?: string;
  instructionsToPatient?: string;
  imagingCenterInstructions?: string;
  labInstructions?: string;
  clinicalQuestion?: string;
  notes?: string;
  items?: ImagingOrderItemBody[];
  specialty?: string;
  reason?: string;
  referredDoctorName?: string;
  institution?: string;
  clinicalSummary?: string;
  referralType?: string;
  questionsToColleague?: string;
  priority?: string;
};

/** @deprecated Use CreateEncounterOrderBody */
export type CreateImagingOrderBody = CreateEncounterOrderBody;

export type UpdateEncounterOrderBody = CreateEncounterOrderBody;

/** @deprecated Use UpdateEncounterOrderBody */
export type UpdateImagingOrderBody = UpdateEncounterOrderBody;

export type EncounterOrderResponse = {
  messageKey?: string;
  message?: string;
  orderId?: string;
  order?: EncounterOrder & {
    clinicalReason?: string;
    instructionsToPatient?: string;
    imagingCenterInstructions?: string;
    imagingCenterInstruction?: string;
    labInstructions?: string;
  };
};

export type EncounterOrderItemMutationResponse = {
  messageKey?: string;
  message?: string;
  orderId: string;
  item?: ImagingOrderItemBody & { _id?: string };
  itemCount?: number;
  updatedAt?: string;
};

export type EncounterOrderFinalizeResponse = {
  messageKey?: string;
  message?: string;
  orderId: string;
  encounterId?: string;
  statusCode?: string;
  status?: string;
};

export type EncounterOrderPreviewResponse = {
  messageKey?: string;
  message?: string;
  preview?: {
    order?: EncounterOrder;
    canFinalize?: boolean;
    downloadUrl?: string;
    pdfUrl?: string;
    url?: string;
  };
  order?: EncounterOrder;
};

export type OrderCatalogItem = {
  _id: string;
  title?: string;
  name?: string;
  label?: string;
  category?: string;
  section?: string;
  isFavorited?: boolean;
};

export type OrderCatalogListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: OrderCatalogItem[];
  labTests?: OrderCatalogItem[];
  imaging?: OrderCatalogItem[];
  procedures?: OrderCatalogItem[];
  data?: {
    items?: OrderCatalogItem[];
    labTests?: OrderCatalogItem[];
    imaging?: OrderCatalogItem[];
    procedures?: OrderCatalogItem[];
  };
};

export type { EncounterOrdersListResponse };
