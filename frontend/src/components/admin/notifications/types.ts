export type AdminNotificationKind =
  | 'appointment'
  | 'message'
  | 'access-request'
  | 'reminder'
  | 'cancel'
  | 'record';

export type AdminNotificationRow = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  description: string;
  timeLabel: string;
  isUnread: boolean;
  isNew: boolean;
};
