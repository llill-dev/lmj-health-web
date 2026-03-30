import { post } from '@/lib/base';
import { authEndpoints } from '@/lib/auth/endpoints';
import type {
  DoctorSignupBody,
  ResendSignupOtpBody,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  AuthError,
} from '@/lib/auth/types';
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from '@/lib/auth/types';

// Enhanced error handler for auth endpoints
const handleAuthError = (error: any): AuthError => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;

  // Map HTTP status to error code
  let code: AuthError['code'] = 'UNKNOWN';
  if (status && AUTH_ERROR_CODES[status]) {
    code = AUTH_ERROR_CODES[status];
  }

  // Refine 403 errors based on message content
  if (status === 403) {
    if (message?.toLowerCase().includes('not verified')) {
      code = 'NOT_VERIFIED';
    } else if (message?.toLowerCase().includes('inactive')) {
      code = 'INACTIVE';
    } else if (message?.toLowerCase().includes('pending')) {
      code = 'PENDING_APPROVAL';
    } else if (message?.toLowerCase().includes('not allowed')) {
      code = 'NOT_ALLOWED';
    } else if (message?.toLowerCase().includes('activate')) {
      code = 'TEMPORARY';
    } else if (message?.toLowerCase().includes('locked')) {
      code = 'LOCKED';
    }
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || !error?.response) {
    code = 'NETWORK_ERROR';
  }

  return {
    code,
    message: message || AUTH_ERROR_MESSAGES[code].en,
    details: error?.response?.data,
  };
};

export const authApi = {
  // Existing signup methods
  signupDoctor: (body: DoctorSignupBody) =>
    post<SignupResponse>(authEndpoints.signup(), body, { locale: 'ar' }),
  resendSignupOtp: (body: ResendSignupOtpBody) =>
    post<SignupResponse>(authEndpoints.resendSignupOtp(), body, {
      locale: 'ar',
    }),

  // login method with enhanced error handling
  login: async (
    body: LoginRequest,
  ): Promise<{ data: LoginResponse } | { error: AuthError }> => {
    try {
      const response = await post<LoginResponse>(authEndpoints.login(), body, {
        locale: 'ar',
      });
      return { data: response };
    } catch (error: any) {
      return { error: handleAuthError(error) };
    }
  },

  // Logout method with automatic token handling
  logoutAll: async (
    token: string,
  ): Promise<{ data: LogoutResponse } | { error: AuthError }> => {
    try {
      const response = await post<LogoutResponse>(
        authEndpoints.logoutAll(),
        {},
        {
          locale: 'ar',
          token, // Explicitly pass token for logout
        },
      );
      return { data: response };
    } catch (error: any) {
      return { error: handleAuthError(error) };
    }
  },
};
