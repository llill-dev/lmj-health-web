import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate } from "react-router-dom";
import VerifyAccount from "@/components/auth/verify/verify-account";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/auth/client";
import AuthBackground from "@/components/auth/AuthBackground";
import { normalizeTokenPair } from "@/lib/auth/session";
import { getRoleRoot, type AppRole } from "@/routes/ProtectedRoute";
import {
  persistSignupSuccessNavState,
  type SignupSuccessLocationState,
} from "@/lib/auth/signupSuccessNavState";
import type { VerifySignupOtpResponse } from "@/lib/auth/types";
import { useI18n } from "@/i18n/provider";

function hasTokenPair(
  value: VerifySignupOtpResponse,
): value is Extract<VerifySignupOtpResponse, { accessToken: string }> {
  return "accessToken" in value && Boolean(value.accessToken);
}

/** يدعم الاستجابة المسطّحة أو تحت data، وأشكال أسماء JWT الشائعة. */
function coerceVerifySignupOtpPayload(
  raw: Record<string, unknown>,
): VerifySignupOtpResponse {
  let base: Record<string, unknown> = raw;
  if ("data" in raw && typeof raw.data === "object" && raw.data !== null) {
    base = raw.data as Record<string, unknown>;
  }

  const pair = normalizeTokenPair(base);

  if (pair && base.userId != null) {
    return {
      message: typeof base.message === "string" ? base.message : "",
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      refreshExpiresAt: pair.refreshExpiresAt ?? "",
      userId:
        typeof base.userId === "string" ? base.userId : String(base.userId),
      role: base.role as Extract<
        VerifySignupOtpResponse,
        { accessToken: string }
      >["role"],
      fullName: typeof base.fullName === "string" ? base.fullName : "",
      email: typeof base.email === "string" ? base.email : undefined,
      phone: typeof base.phone === "string" ? base.phone : undefined,
      patientPublicId:
        typeof base.patientPublicId === "string"
          ? base.patientPublicId
          : undefined,
      actorIds:
        typeof base.actorIds === "object" && base.actorIds !== null
          ? (base.actorIds as Extract<
              VerifySignupOtpResponse,
              { accessToken: string }
            >["actorIds"])
          : {},
    };
  }

  return {
    message: typeof base.message === "string" ? base.message : "",
    userId:
      base.userId != null
        ? typeof base.userId === "string"
          ? base.userId
          : String(base.userId)
        : "",
    role: "doctor",
    status: "pending_admin_approval",
    fullName: typeof base.fullName === "string" ? base.fullName : "",
    email: typeof base.email === "string" ? base.email : undefined,
    phone: typeof base.phone === "string" ? base.phone : undefined,
    patientPublicId: null,
    actorIds:
      typeof base.actorIds === "object" && base.actorIds !== null
        ? (base.actorIds as Extract<
            VerifySignupOtpResponse,
            { status: "pending_admin_approval" }
          >["actorIds"])
        : {},
  };
}

function persistVerifiedSession(
  response: Extract<VerifySignupOtpResponse, { accessToken: string }>,
) {
  useAuthStore.getState().applySession(
    {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      refreshExpiresAt: response.refreshExpiresAt,
    },
    {
      userId: response.userId,
      role: response.role,
      fullName: response.fullName,
      email: response.email ?? "",
      phone: response.phone ?? "",
      actorIds: response.actorIds,
      patientPublicId: response.patientPublicId,
      accountStatus: "active",
    },
  );
}

function VerifyOtpContent() {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  /** عند النجاح نوقف بوابة التوجيه لتجنّب الإرسال إلى /signup قبل navigate(). */
  const allowGuardRedirectsRef = useRef(true);
  const pending = useAuthStore((s) => s.pendingVerification);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  if (!pending) {
    if (allowGuardRedirectsRef.current) {
      if (accessToken && user?.role) {
        return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
      }
      return <Navigate to="/signup" replace />;
    }
    return (
      <div className="min-h-[280px]" aria-busy aria-label={t("auth.verifyOtp.completing")}>
        <span className="sr-only">{t("auth.verifyOtp.completing")}</span>
      </div>
    );
  }

  const destination =
    pending.channel === "email" ? pending.email : pending.phone;

  return (
    <VerifyAccount
      destination={destination}
      onBack={() => navigate(-1)}
      onResend={async () => {
        if (pending.channel === "email") {
          await authApi.resendSignupOtp({
            channel: "email",
            email: pending.email,
          });
          return;
        }

        await authApi.resendSignupOtp({
          channel: "whatsapp",
          phone: pending.phone,
        });
      }}
      onVerify={async (otp) => {
        const raw = (await authApi.verifySignupOtp(
          pending.channel === "email"
            ? {
                channel: "email",
                email: pending.email,
                otp,
                clientType: "web",
              }
            : {
                channel: "whatsapp",
                phone: pending.phone,
                otp,
                clientType: "web",
              },
        )) as unknown as Record<string, unknown>;

        const response = coerceVerifySignupOtpPayload(raw);

        allowGuardRedirectsRef.current = false;

        if (hasTokenPair(response)) {
          persistVerifiedSession(response);
          const role = (
            response.role === "data_entry" ? "data-entry" : response.role
          ) as AppRole;

          toast(t("auth.verifyOtp.success.body"), {
            title: t("auth.verifyOtp.success.title"),
            variant: "success",
            durationMs: 3800,
          });

          const successState = {
            flow: "session_ready" as const,
            redirectTo: getRoleRoot(role),
            title: t("auth.verifyOtp.success.completedTitle"),
            message: response.message,
          };
          persistSignupSuccessNavState(successState);

          navigate("/signup-success", {
            replace: true,
            state: successState satisfies SignupSuccessLocationState,
          });
          return;
        }

        const pendingState: SignupSuccessLocationState = {
          flow: "pending_doctor",
          title: t("auth.verifyOtp.pending.title"),
          message: response.message,
        };

        toast(
          t("auth.verifyOtp.pending.body"),
          {
            title: t("auth.verifyOtp.pending.badge"),
            variant: "info",
            durationMs: 4500,
          },
        );

        persistSignupSuccessNavState(pendingState);

        navigate("/signup-success", { replace: true, state: pendingState });
      }}
    />
  );
}

export default function VerifyOtpPage() {
  const { t } = useI18n();
  return (
    <>
      <Helmet>
        <title>{t("auth.page.verifyOtp.title")}</title>
      </Helmet>
      <AuthBackground>
        <VerifyOtpContent />
      </AuthBackground>
    </>
  );
}
