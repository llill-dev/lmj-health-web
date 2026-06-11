export type ActivityLogPeriod = 'all' | 'today' | 'week' | 'month';

export type ActivityLogActionType =
  | 'view_record'
  | 'upload_file'
  | 'login'
  | 'update_profile'
  | 'access_request';

export type DoctorActivityLogItem = {
  id: string;
  title: string;
  timestamp: string;
  actionType: ActivityLogActionType;
  dateLabel: string;
  timeLabel: string;
  patientName?: string;
  operationTypeLabel: string;
  ip?: string;
  device?: string;
};
