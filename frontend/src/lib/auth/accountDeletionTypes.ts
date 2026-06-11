export type AccountDeletionScope = 'patient' | 'doctor';

export type AccountDeletionStatus = 'none' | 'requested' | 'pending' | 'deleted';

export type AccountDeletionReasonCode =
  | 'privacy'
  | 'not_useful'
  | 'better_alternative'
  | 'technical'
  | 'other';

export type AccountDeletionStatusResponse = {
  message?: string;
  messageKey?: string;
  status: AccountDeletionStatus;
  requestedAt?: string | null;
  recoverUntil?: string | null;
  deletedAt?: string | null;
};

export type AccountDeletionVerifyPasswordBody = {
  currentPassword: string;
};

export type AccountDeletionVerifyPasswordResponse = {
  message?: string;
  messageKey?: string;
  otpSent?: boolean;
  destination?: string;
  channel?: 'email' | 'whatsapp';
};

export type AccountDeletionSendOtpBody = {
  channel?: 'email' | 'whatsapp';
  currentPassword?: string;
};

export type AccountDeletionSendOtpResponse = {
  message?: string;
  messageKey?: string;
  destination?: string;
  channel?: 'email' | 'whatsapp';
  otpSent?: boolean;
};

export type AccountDeletionConfirmBody = {
  otp: string;
  currentPassword?: string;
};

export type AccountDeletionConfirmResponse = {
  message?: string;
  messageKey?: string;
  verified?: boolean;
  deletionToken?: string;
};

export type AccountDeletionRequestBody = {
  reason?: string;
  reasonCode?: AccountDeletionReasonCode;
  feedback?: string;
  currentPassword?: string;
  otp?: string;
  deletionToken?: string;
};

export type AccountDeletionRequestResponse = {
  message?: string;
  messageKey?: string;
  status: AccountDeletionStatus;
  recoverUntil?: string | null;
  requestedAt?: string | null;
};

export type AccountDeletionCancelResponse = {
  message?: string;
  messageKey?: string;
  status: AccountDeletionStatus;
};

export type DoctorRecoveryChannel = 'email' | 'whatsapp';

export type DoctorRecoveryIdentity = {
  channel: DoctorRecoveryChannel;
  email: string;
  phone: string;
};

export type DoctorRecoveryOtpStartBody = DoctorRecoveryIdentity;

export type DoctorRecoveryOtpStartResponse = {
  message?: string;
  messageKey?: string;
  destination?: string;
  channel?: DoctorRecoveryChannel;
};

export type DoctorRecoveryOtpVerifyBody = DoctorRecoveryIdentity & {
  otp: string;
};

export type DoctorRecoveryOtpVerifyResponse = {
  message?: string;
  messageKey?: string;
  status?: AccountDeletionStatus;
};

export type DoctorRestoreRequestOtpVerifyBody = DoctorRecoveryOtpVerifyBody & {
  reason: string;
};
