export type SignupChannel = 'email' | 'whatsapp';
export type SignupRole = 'patient' | 'doctor';
export type ClientType = 'patient_mobile' | 'doctor_mobile' | 'web';

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
  /** ISO calendar date `YYYY-MM-DD` (API-3 /auth/signup) */
  dateOfBirth: string;
  address: string;
  role: 'doctor';
  channel: SignupChannel;
  /** Catalog selection from GET /api/meta/doctor-specializations. */
  specializationKey?: string;
  /** Free-text specialization when the desired option is not in the catalog. */
  customSpecializationText?: string;
  /** Legacy fallback accepted by the backend as a custom specialization request. */
  specialization?: string;
  medicalLicenseNumber: string;
  bio: string;
  education: string;
  clinicAddress: string;
  locationCity?: string;
  locationCountry?: string;
  /** Optional; values `online` | `offline` per API-3 */
  consultationTypes?: Array<'online' | 'offline'>;
  clinicLat?: number;
  clinicLng?: number;
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

export type VerifySignupOtpBody =
  | {
      channel: 'email';
      email: string;
      otp: string;
      clientType?: ClientType;
    }
  | {
      channel: 'whatsapp';
      phone: string;
      otp: string;
      clientType?: ClientType;
    };

export type AuthActorIds = {
  patientId?: string | null;
  doctorId?: string | null;
  secretaryId?: string | null;
  assignedDoctorId?: string | null;
};

export type VerifySignupOtpResponse =
  | {
      message: string;
      token: string;
      userId: string;
      role: 'patient' | 'doctor' | 'secretary' | 'admin' | 'data_entry';
      fullName: string;
      email?: string;
      phone?: string;
      patientPublicId?: string | null;
      actorIds: AuthActorIds;
    }
  | {
      message: string;
      userId: string;
      role: 'doctor';
      status: 'pending_admin_approval';
      fullName: string;
      email?: string;
      phone?: string;
      patientPublicId: null;
      actorIds: AuthActorIds;
    };

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
  actorIds: AuthActorIds;
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
export type DoctorSignupSpecialtyOption = {
  /** Backend specialization key, sent as `specializationKey` during signup. */
  key: string;
  /** Localized label shown in the signup dropdown. */
  labelAr: string;
  /** English label when the API returns all languages. */
  labelEn?: string;
  /** Select value; currently identical to `key`. */
  value: string;
};

export type DoctorSpecialtiesMetaResponse = {
  messageKey?: string;
  message?: string;
  doctorSpecializations?: unknown[];
  specialties?: unknown[];
  lookups?: unknown[];
  options?: unknown[];
  items?: unknown[];
  results?: unknown[];
  data?: unknown[];
};


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


