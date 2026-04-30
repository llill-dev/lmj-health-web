import { post } from '@/lib/base';
import { ApiError } from '@/lib/base';
import { authEndpoints } from '@/lib/auth/endpoints';
import type {
  DoctorSignupBody,
  ResendSignupOtpBody,
  VerifySignupOtpBody,
  VerifySignupOtpResponse,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  AuthError,
} from '@/lib/auth/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/auth/types';

// ─────────────────────────────────────────────────────────────────────────────
// Error normaliser
// Reads the structured ApiError (status + messageKey + body) produced by
// base.ts to return a fully typed AuthError with a meaningful code.
// ─────────────────────────────────────────────────────────────────────────────
const handleAuthError = (error: unknown): AuthError => {
  // ── ApiError (the normal path) ──────────────────────────────────────────
  if (error instanceof ApiError) {
    const { status, messageKey, body } = error;
    const backendMessage =
      (body.message as string | undefined) ||
      (body.error as string | undefined) ||
      error.message;

    let code: AuthError['code'] = 'UNKNOWN';

    switch (status) {
      case 401:
        code = 'INVALID_CREDENTIALS';
        break;
      case 410:
        code = 'DELETED';
        break;
      case 403: {
        // Refine 403 using messageKey first (most reliable), then fall back
        // to scanning the message text for known phrases.
        const key = messageKey ?? '';
        const msg = backendMessage.toLowerCase();

        if (key.includes('notVerified') || msg.includes('not verified')) {
          code = 'NOT_VERIFIED';
        } else if (key.includes('inactive') || msg.includes('inactive')) {
          code = 'INACTIVE';
        } else if (
          key.includes('pendingApproval') ||
          key.includes('pending') ||
          msg.includes('pending')
        ) {
          code = 'PENDING_APPROVAL';
        } else if (key.includes('notAllowed') || msg.includes('not allowed')) {
          code = 'NOT_ALLOWED';
        } else if (key.includes('activate') || msg.includes('activate')) {
          code = 'TEMPORARY';
        } else if (key.includes('locked') || msg.includes('locked')) {
          code = 'LOCKED';
        } else {
          code = 'NOT_VERIFIED';
        }
        break;
      }
      default:
        code = 'UNKNOWN';
    }

    return {
      code,
      message: backendMessage || AUTH_ERROR_MESSAGES[code].ar,
      details: body,
    };
  }

  // ── Network / unknown error ─────────────────────────────────────────────
  if (error instanceof Error && error.message) {
    return { code: 'NETWORK_ERROR', message: error.message };
  }

  return {
    code: 'UNKNOWN',
    message: AUTH_ERROR_MESSAGES['UNKNOWN'].ar,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth API client
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  signupDoctor: (body: DoctorSignupBody) =>
    post<SignupResponse>(authEndpoints.signup(), body, {
      locale: 'ar',
      omitAuth: true,
    }),

  resendSignupOtp: (body: ResendSignupOtpBody) =>
    post<SignupResponse>(authEndpoints.resendSignupOtp(), body, {
      locale: 'ar',
      omitAuth: true,
    }),

  verifySignupOtp: (body: VerifySignupOtpBody) =>
    post<VerifySignupOtpResponse>(authEndpoints.verifySignupOtp(), body, {
      locale: 'ar',
      omitAuth: true,
    }),

  login: async (
    body: LoginRequest,
  ): Promise<{ data: LoginResponse } | { error: AuthError }> => {
    try {
      const response = await post<LoginResponse>(authEndpoints.login(), body, {
        locale: 'ar',
        omitAuth: true,
      });
      return { data: response };
    } catch (error) {
      return { error: handleAuthError(error) };
    }
  },

  logoutAll: async (
    token: string,
  ): Promise<{ data: LogoutResponse } | { error: AuthError }> => {
    try {
      const response = await post<LogoutResponse>(
        authEndpoints.logoutAll(),
        {},
        { locale: 'ar', token },
      );
      return { data: response };
    } catch (error) {
      return { error: handleAuthError(error) };
    }
  },
};
