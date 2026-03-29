export type SignupChannel = 'email' | 'whatsapp';
export type SignupRole = 'patient' | 'doctor';

export type SignupResponse = {
  message: string;
  userId: string;
  role: SignupRole;
  status?: 'verification_pending';
  fullName: string;
  email: string;
  phone: string;
  patientPublicId: string | null;
};

export type DoctorSignupBody = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  role: 'doctor';
  channel: SignupChannel;
  specialization: string;
  medicalLicenseNumber: string;
  bio: string;
  education: string;
  clinicAddress: string;
  locationCity?: string;
  locationCountry?: string;
};

export type ResendSignupOtpBody =
  | {
      channel: 'email';
      email: string;
    }
  | {
      channel: 'whatsapp';
      phone: string;
    };
