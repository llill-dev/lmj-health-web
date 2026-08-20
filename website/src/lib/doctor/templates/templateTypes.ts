export type DoctorTemplateType =
  | 'PRESCRIPTION'
  | 'LAB_ORDER'
  | 'IMAGING_ORDER'
  | 'PROCEDURE_ORDER'
  | 'REFERRAL_ORDER';

export type DoctorTemplateApplication = {
  [key: string]: unknown;
};

export type DoctorTemplateRecord = {
  _id: string;
  type?: DoctorTemplateType;
  name?: string;
  description?: string;
  payload?: DoctorTemplateApplication;
  isArchived?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

export type DoctorTemplatesListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  templates?: DoctorTemplateRecord[];
};

export type CreateDoctorTemplateBody = {
  type: DoctorTemplateType;
  name: string;
  description?: string;
  payload?: DoctorTemplateApplication;
};

export type UpdateDoctorTemplateBody = Partial<CreateDoctorTemplateBody>;

export type DoctorTemplateApplyResponse = {
  messageKey?: string;
  message?: string;
  templateId?: string;
  type?: DoctorTemplateType;
  name?: string;
  application?: DoctorTemplateApplication;
  template?: DoctorTemplateRecord;
};

export type DoctorTemplateMutationResponse = {
  messageKey?: string;
  message?: string;
  template?: DoctorTemplateRecord;
};

export type DoctorTemplateDeleteResponse = {
  messageKey?: string;
  message?: string;
  templateId?: string;
};
