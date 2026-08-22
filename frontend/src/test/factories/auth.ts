import type { LoginResponse, LogoutAllResponse, LogoutResponse } from '@/lib/auth/types';

type LoginRole = LoginResponse['role'];

export function loginResponseFactory(
  overrides: Partial<LoginResponse> = {},
): LoginResponse {
  const role: LoginRole = overrides.role ?? 'doctor';

  return {
    message: 'تم تسجيل الدخول بنجاح',
    userId: 'user-1',
    role,
    accountStatus: 'active',
    fullName: 'أحمد الطبيب',
    email: 'doctor@example.com',
    phone: '+963912345678',
    patientPublicId: role === 'patient' ? 'patient-public-1' : undefined,
    actorIds: {
      doctorId: role === 'doctor' ? 'doctor-1' : null,
      patientId: role === 'patient' ? 'patient-1' : null,
      secretaryId: role === 'secretary' ? 'secretary-1' : null,
    },
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    refreshExpiresAt: '2030-01-01T00:00:00.000Z',
    accountDeletionStatus: 'none',
    requestedAt: undefined,
    recoverUntil: undefined,
    ...overrides,
  };
}

export function logoutResponseFactory(
  overrides: Partial<LogoutResponse> = {},
): LogoutResponse {
  return {
    message: 'تم تسجيل الخروج بنجاح',
    ...overrides,
  };
}

export function logoutAllResponseFactory(
  overrides: Partial<LogoutAllResponse> = {},
): LogoutAllResponse {
  return {
    message: 'تم تسجيل الخروج من جميع الأجهزة',
    fullName: 'أحمد الطبيب',
    email: 'doctor@example.com',
    phone: '+963912345678',
    patientPublicId: undefined,
    ...overrides,
  };
}
