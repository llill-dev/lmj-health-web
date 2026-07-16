import { post, postResult } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { authEndpoints } from "@/lib/auth/endpoints";
import type {
  DoctorSignupBody,
  ResendSignupOtpBody,
  VerifySignupOtpBody,
  VerifySignupOtpResponse,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  LogoutAllResponse,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequestBody,
  ResetPasswordRequestResponse,
  VerifyResetOtpBody,
  VerifyResetOtpResponse,
  NewPasswordBody,
  NewPasswordResponse,
  ClaimAccountRequestBody,
  ClaimAccountRequestResponse,
  ClaimAccountVerifyBody,
  ClaimAccountVerifyResponse,
  AuthError,
} from "@/lib/auth/types";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/types";
import type { SignupFieldConflictMessages } from "@/lib/auth/signupMessaging";

function readAuthBodyString(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key];
  return typeof value === "string" ? value : undefined;
}

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
      readAuthBodyString(body, "message") ||
      readAuthBodyString(body, "error") ||
      error.message;

    let code: AuthError["code"] = "UNKNOWN";

    switch (status) {
      case 401:
        code = "INVALID_CREDENTIALS";
        break;
      case 410:
        code = "DELETED";
        break;
      case 403: {
        // Refine 403 using messageKey first (most reliable), then fall back
        // to scanning the message text for known phrases.
        const key = messageKey ?? "";
        const msg = backendMessage.toLowerCase();

        if (key.includes("notVerified") || msg.includes("not verified")) {
          code = "NOT_VERIFIED";
        } else if (key.includes("inactive") || msg.includes("inactive")) {
          code = "INACTIVE";
        } else if (
          key.includes("pendingApproval") ||
          key.includes("pending") ||
          msg.includes("pending")
        ) {
          code = "PENDING_APPROVAL";
        } else if (key.includes("notAllowed") || msg.includes("not allowed")) {
          code = "NOT_ALLOWED";
        } else if (key.includes("activate") || msg.includes("activate")) {
          code = "TEMPORARY";
        } else if (key.includes("locked") || msg.includes("locked")) {
          code = "LOCKED";
        } else if (
          key.includes("doctorRestoreRequestAvailable") ||
          body.lifecycleAction === "restore_request"
        ) {
          code = "DELETION_RECOVERY";
        } else if (
          key.includes("doctorSelfRecoveryAvailable") ||
          key.includes("accountDeletion") ||
          body.lifecycleAction === "self_recovery"
        ) {
          code = "DELETION_RECOVERY";
        } else {
          code = "NOT_VERIFIED";
        }
        break;
      }
      default:
        code = "UNKNOWN";
    }

    return {
      code,
      message: backendMessage || AUTH_ERROR_MESSAGES[code].ar,
      details: body,
    };
  }

  // ── Network / unknown error ─────────────────────────────────────────────
  if (error instanceof Error && error.message) {
    return { code: "NETWORK_ERROR", message: error.message };
  }

  return {
    code: "UNKNOWN",
    message: AUTH_ERROR_MESSAGES["UNKNOWN"].ar,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth API client
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  signupDoctor: (body: DoctorSignupBody) =>
    post<SignupResponse>(authEndpoints.signup(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  /**
   * API-3 الحالي لا يوثق endpoint مستقلاً لفحص تعارض البريد/الهاتف قبل التسجيل،
   * لذلك نعتمد على تحقق الخادم داخل `POST /api/auth/signup`.
   */
  signupDoctorContactPrecheck: async (
    body: Pick<DoctorSignupBody, "email" | "phone">,
  ): Promise<
    { ok: true; skipped?: boolean } | { conflict: SignupFieldConflictMessages }
  > => {
    void body;
    return { ok: true, skipped: true };
  },

  resendSignupOtp: (body: ResendSignupOtpBody) =>
    post<SignupResponse>(authEndpoints.resendSignupOtp(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  verifySignupOtp: (body: VerifySignupOtpBody) =>
    post<VerifySignupOtpResponse>(authEndpoints.verifySignupOtp(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  login: async (
    body: LoginRequest,
  ): Promise<{ data: LoginResponse } | { error: AuthError }> => {
    try {
      const response = await postResult<LoginResponse>(
        authEndpoints.login(),
        body,
        {
          locale: "ar",
          omitAuth: true,
          expectedStatuses: [400, 401, 403, 410],
        },
      );

      if ("error" in response) {
        return { error: handleAuthError(response.error) };
      }

      return { data: response.data };
    } catch (error) {
      return { error: handleAuthError(error) };
    }
  },

  refresh: (body: RefreshTokenRequest) =>
    post<RefreshTokenResponse>(authEndpoints.refresh(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  logout: async (
    accessToken: string,
  ): Promise<{ data: LogoutResponse } | { error: AuthError }> => {
    try {
      const response = await post<LogoutResponse>(
        authEndpoints.logout(),
        {},
        { locale: "ar", token: accessToken },
      );
      return { data: response };
    } catch (error) {
      return { error: handleAuthError(error) };
    }
  },

  logoutAll: async (
    accessToken: string,
  ): Promise<{ data: LogoutAllResponse } | { error: AuthError }> => {
    try {
      const response = await post<LogoutAllResponse>(
        authEndpoints.logoutAll(),
        {},
        { locale: "ar", token: accessToken },
      );
      return { data: response };
    } catch (error) {
      return { error: handleAuthError(error) };
    }
  },

  requestPasswordReset: (body: ResetPasswordRequestBody) =>
    post<ResetPasswordRequestResponse>(authEndpoints.resetPassword(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  resendResetOtp: (body: ResetPasswordRequestBody) =>
    post<ResetPasswordRequestResponse>(authEndpoints.resendResetOtp(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  verifyResetOtp: (body: VerifyResetOtpBody) =>
    post<VerifyResetOtpResponse>(authEndpoints.verifyResetOtp(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  setNewPassword: (body: NewPasswordBody) =>
    post<NewPasswordResponse>(authEndpoints.newPassword(), body, {
      locale: "ar",
      omitAuth: true,
    }),

  requestClaimAccount: (body: ClaimAccountRequestBody) =>
    post<ClaimAccountRequestResponse>(
      authEndpoints.claimAccountRequest(),
      body,
      { locale: "ar", omitAuth: true },
    ),

  verifyClaimAccount: (body: ClaimAccountVerifyBody) =>
    post<ClaimAccountVerifyResponse>(authEndpoints.claimAccountVerify(), body, {
      locale: "ar",
      omitAuth: true,
    }),
};
