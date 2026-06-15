export type DoctorActivityLogRecord = {
  _id: string;
  type: string;
  actorRole?: string;
  actorDisplayName?: string;
  entityType?: string;
  entityId?: string;
  occurredAt: string;
  details?: Record<string, unknown>;
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
