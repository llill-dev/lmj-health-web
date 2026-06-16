export type DoctorTemplateType =
  | 'PRESCRIPTION'
  | 'LAB_ORDER'
  | 'IMAGING_ORDER'
  | 'PROCEDURE_ORDER'
  | 'REFERRAL_ORDER';

export type DoctorTemplateRecord = {
  _id: string;
  type?: DoctorTemplateType;
  name?: string;
  description?: string;
  payload?: Record<string, unknown>;
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
  payload?: Record<string, unknown>;
};

export type UpdateDoctorTemplateBody = Partial<CreateDoctorTemplateBody>;
