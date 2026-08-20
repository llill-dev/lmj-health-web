export type PrescriptionItemBody = {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: string | number;
  route?: string;
  startDate?: string;
  endDate?: string;
  times?: string[];
  remindersEnabled?: boolean;
  instructions?: string;
  notes?: string;
  sortOrder?: number;
  source?: string;
};

export type CreateEncounterPrescriptionBody = {
  generalInstructions?: string;
  notes?: string;
  items?: PrescriptionItemBody[];
};

export type UpdateEncounterPrescriptionBody = {
  generalInstructions?: string;
  notes?: string;
};

export type EncounterPrescriptionRecord = {
  _id: string;
  status?: string;
  encounterId?: string;
  generalInstructions?: string;
  notes?: string;
  items?: Array<
    PrescriptionItemBody & {
      _id?: string;
    }
  >;
  finalizedAt?: string | null;
  patient?: {
    _id?: string;
    publicId?: string;
    user?: { fullName?: string };
  };
};

export type EncounterPrescriptionResponse = {
  messageKey?: string;
  message?: string;
  prescription: EncounterPrescriptionRecord;
};

export type EncounterPrescriptionItemMutationResponse = {
  messageKey?: string;
  message?: string;
  prescriptionId: string;
  item?: PrescriptionItemBody & { _id?: string };
  itemCount?: number;
  updatedAt?: string;
};

export type EncounterPrescriptionFinalizeResponse = {
  messageKey?: string;
  message?: string;
  prescriptionId: string;
  status?: string;
  finalizedAt?: string;
};

export type EncounterPrescriptionsListResponse = {
  messageKey?: string;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  prescriptions?: EncounterPrescriptionRecord[];
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
