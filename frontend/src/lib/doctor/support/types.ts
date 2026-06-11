export type DoctorSupportRequestType =
  | 'technical'
  | 'account'
  | 'billing'
  | 'verification'
  | 'other';

export type DoctorSupportContactForm = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  requestType: DoctorSupportRequestType;
};

export type DoctorSupportIdentity = {
  doctorProfileId?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
};
