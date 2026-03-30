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

// Login/Logout Types
export type ClientType = 'patient_mobile' | 'doctor_mobile' | 'web';

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  clientType?: ClientType;
}

export interface LoginResponse {
  message: string;
  token: string;
  userId: string;
  role: 'patient' | 'doctor' | 'secretary' | 'admin' | 'data_entry';
  accountStatus: 'active' | 'inactive' | 'pending' | 'suspended';
  fullName: string;
  email?: string;
  phone?: string;
  patientPublicId?: string;
  actorIds: {
    patientId?: string;
    doctorId?: string;
    secretaryId?: string;
    assignedDoctorId?: string;
  };
  accountDeletionStatus: 'none' | 'pending' | 'requested';
  requestedAt?: string;
  recoverUntil?: string;
}

export interface LogoutResponse {
  message: string;
  fullName: string;
  email?: string;
  phone?: string;
  patientPublicId?: string;
}

export interface AuthError {
  code:
    | 'INVALID_CREDENTIALS'
    | 'NOT_VERIFIED'
    | 'INACTIVE'
    | 'PENDING_APPROVAL'
    | 'NOT_ALLOWED'
    | 'TEMPORARY'
    | 'LOCKED'
    | 'DELETED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  message: string;
  details?: any;
}

// API Error mapping
export const AUTH_ERROR_CODES: Record<number, AuthError['code']> = {
  401: 'INVALID_CREDENTIALS',
  403: 'NOT_VERIFIED', // Will be refined based on message
  410: 'DELETED',
  500: 'UNKNOWN',
};

// Bilingual error messages
export const AUTH_ERROR_MESSAGES: Record<
  AuthError['code'],
  { ar: string; en: string }
> = {
  INVALID_CREDENTIALS: {
    ar: 'البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة',
    en: 'Invalid email/phone or password',
  },
  NOT_VERIFIED: {
    ar: 'الحساب غير موثق، يرجى التحقق من بريدك الإلكتروني',
    en: 'Account not verified, please check your email',
  },
  INACTIVE: {
    ar: 'الحساب غير نشط',
    en: 'Account is inactive',
  },
  PENDING_APPROVAL: {
    ar: 'حساب الطبيب في انتظار موافقة الإدارة',
    en: 'Doctor account pending admin approval',
  },
  NOT_ALLOWED: {
    ar: 'هذا الحساب غير مسموح له باستخدام التطبيق',
    en: 'This account is not allowed for this app',
  },
  TEMPORARY: {
    ar: 'يرجى تفعيل حسابك قبل تسجيل الدخول',
    en: 'Please activate your account before logging in',
  },
  LOCKED: {
    ar: 'الحساب مقفول',
    en: 'Account is locked',
  },
  DELETED: {
    ar: 'تم حذف الحساب',
    en: 'Account has been deleted',
  },
  NETWORK_ERROR: {
    ar: 'خطأ في الاتصال بالشبكة',
    en: 'Network connection error',
  },
  UNKNOWN: {
    ar: 'حدث خطأ غير متوقع',
    en: 'An unexpected error occurred',
  },
};
