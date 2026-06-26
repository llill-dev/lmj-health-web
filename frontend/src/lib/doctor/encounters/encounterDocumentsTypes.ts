export type EncounterDocumentSourceType =
  | 'patient_file'
  | 'order'
  | 'imaging_order'
  | 'prescription';

export type EncounterDocumentRecord = {
  _id?: string;
  id?: string;
  title?: string;
  note?: string;
  sharedWithPatient?: boolean;
  sharedAt?: string | null;
  sourceType?: EncounterDocumentSourceType | string;
  sourceId?: string;
  createdAt?: string;
};

export type EncounterDocumentsListResponse = {
  messageKey?: string;
  message?: string;
  documents?: EncounterDocumentRecord[];
};

export type EncounterDocumentLinkBody = {
  patientFileId?: string;
  sourceType?: EncounterDocumentSourceType;
  sourceId?: string;
  title?: string;
  note?: string;
  tags?: string[];
};

export type EncounterDocumentLinkResponse = {
  messageKey?: string;
  message?: string;
  document?: EncounterDocumentRecord;
};

export type EncounterDocumentShareBody = {
  shareNote?: string;
};

export type EncounterDocumentShareResponse = {
  messageKey?: string;
  message?: string;
  documentId?: string;
  title?: string;
  sharedWithPatient?: boolean;
  sharedAt?: string;
};
