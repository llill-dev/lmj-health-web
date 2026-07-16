export type DoctorActivityLogDetails = {
  clientType?: string;
  userAgent?: string;
  platform?: string;
  patientName?: string;
  patientPublicId?: string;
  ip?: string;
  [key: string]: unknown;
};

export type DoctorActivityLogRecord = {
  _id: string;
  type: string;
  actorRole?: string;
  actorDisplayName?: string;
  entityType?: string;
  entityId?: string;
  occurredAt: string;
  details?: DoctorActivityLogDetails;
};

export type DoctorActivityLogListParams = {
  page?: number;
  limit?: number;
  actorRole?: string;
  type?: string | string[];
  from?: string;
  to?: string;
};

export type DoctorActivityLogListResponse = {
  messageKey?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  activityLogs?: DoctorActivityLogRecord[];
};
