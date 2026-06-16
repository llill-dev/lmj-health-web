export type DoctorSecretaryUser = {
  _id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  gender?: string;
  accountStatus?: string;
  photoUrl?: string;
};

export type DoctorSecretary = {
  _id: string;
  id?: string;
  userId?: string;
  permissions?: string[];
  assignedDoctor?: string;
  user?: DoctorSecretaryUser;
  /** Flat fields returned by some API responses (POST/GET). */
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
};

export type DoctorSecretariesListResponse = {
  total?: number;
  secretaries?: DoctorSecretary[];
  message?: string;
};

export type CreateDoctorSecretaryBody = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'Male' | 'Female';
  permissions?: string[];
};

export type UpdateDoctorSecretaryBody = {
  fullName?: string;
  phone?: string;
  gender?: 'Male' | 'Female';
  permissions?: string[];
};

export type SecretaryStatusFilter = 'all' | 'active' | 'disabled';
