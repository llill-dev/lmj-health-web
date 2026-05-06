import { Suspense, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import VerifyAccount from '@/components/auth/verify/verify-account';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth/client';
import AuthBackground from '@/components/auth/AuthBackground';
import { writeAuthToken, writeAuthUser } from '@/lib/cookies';
import { getRoleRoot, type AppRole } from '@/routes/ProtectedRoute';
import type { SignupSuccessLocationState } from '@/pages/auth/signup-success/SignupSuccessPage';
import type { VerifySignupOtpResponse } from '@/lib/auth/types';

/** يدعم الاستجابة المسطّحة أو تحت data، وأشكال أسماء JWT الشائعة. */
function coerceVerifySignupOtpPayload(
  raw: Record<string, unknown>,
): VerifySignupOtpResponse {
  let base: Record<string, unknown> = raw;
  if ('data' in raw && typeof raw.data === 'object' && raw.data !== null) {
    base = raw.data as Record<string, unknown>;
  }

  const pickToken =
    (typeof base.token === 'string' && base.token) ||
    (typeof base.accessToken === 'string' && base.accessToken) ||
    (typeof base.access_token === 'string' && base.access_token) ||
    undefined;

  if (pickToken && base.userId != null) {
    return {
      message: typeof base.message === 'string' ? base.message : '',
      token: pickToken,
      userId:
        typeof base.userId === 'string' ? base.userId : String(base.userId),
      role: base.role as Extract<VerifySignupOtpResponse, { token: string }>['role'],
      fullName: typeof base.fullName === 'string' ? base.fullName : '',
      email: typeof base.email === 'string' ? base.email : undefined,
      phone: typeof base.phone === 'string' ? base.phone : undefined,
      patientPublicId:
        typeof base.patientPublicId === 'string' ? base.patientPublicId : undefined,
      actorIds:
        typeof base.actorIds === 'object' && base.actorIds !== null
          ? (base.actorIds as Extract<VerifySignupOtpResponse, { token: string }>['actorIds'])
          : {},
    };
  }

  return {
    message: typeof base.message === 'string' ? base.message : '',
    userId:
      base.userId != null
        ? typeof base.userId === 'string'
          ? base.userId
          : String(base.userId)
        : '',
    role: 'doctor',
    status: 'pending_admin_approval',
    fullName: typeof base.fullName === 'string' ? base.fullName : '',
    email: typeof base.email === 'string' ? base.email : undefined,
    phone: typeof base.phone === 'string' ? base.phone : undefined,
    patientPublicId: null,
    actorIds:
      typeof base.actorIds === 'object' && base.actorIds !== null
        ? (base.actorIds as Extract<
            VerifySignupOtpResponse,
            { status: 'pending_admin_approval' }
          >['actorIds'])
        : {},
  };
}

function persistVerifiedSession(response: Extract<VerifySignupOtpResponse, { token: string }>) {
  const role = (response.role === 'data_entry'
    ? 'data-entry'
    : response.role) as AppRole;

  useAuthStore.setState({
    user: {
      id: response.userId,
      email: response.email ?? '',
      phone: response.phone ?? '',
      role,
      verified: true,
      name: response.fullName,
    },
    token: response.token,
    isAuthenticated: true,
    pendingVerification: null,
  });

  useAuthStore.getState().setPendingVerification(null);

  writeAuthToken(response.token);
  writeAuthUser({
    userId: response.userId,
    role: response.role,
    fullName: response.fullName,
    email: response.email ?? '',
    phone: response.phone ?? '',
    actorIds: Object.fromEntries(
      Object.entries(response.actorIds ?? {}).map(([key, value]) => [
        key,
        value ?? undefined,
      ]),
    ) as Record<string, string | undefined>,
    patientPublicId: response.patientPublicId,
  });
}

function VerifyOtpContent() {
  const navigate = useNavigate();
  /** عند النجاح نوقف بوابة التوجيه لتجنّب الإرسال إلى /signup قبل navigate(). */
  const allowGuardRedirectsRef = useRef(true);
  const pending = useAuthStore((s) => s.pendingVerification);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!pending) {
    if (allowGuardRedirectsRef.current) {
      if (token && user?.role) {
        return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
      }
      return <Navigate to='/signup' replace />;
    }
    return (
      <div className='min-h-[280px]' aria-busy aria-label='جاري إكمال التحقق'>
        <span className='sr-only'>جاري إكمال التحقق…</span>
      </div>
    );
  }

  const destination =
    pending.channel === 'email' ? pending.email : pending.phone;

  return (
    <VerifyAccount
      destination={destination}
      onBack={() => navigate(-1)}
      onResend={async () => {
        if (pending.channel === 'email') {
          await authApi.resendSignupOtp({
            channel: 'email',
            email: pending.email,
          });
          return;
        }

        await authApi.resendSignupOtp({
          channel: 'whatsapp',
          phone: pending.phone,
        });
      }}
      onVerify={async (otp) => {
        const raw = (await authApi.verifySignupOtp(
          pending.channel === 'email'
            ? {
                channel: 'email',
                email: pending.email,
                otp,
                clientType: 'web',
              }
            : {
                channel: 'whatsapp',
                phone: pending.phone,
                otp,
                clientType: 'web',
              },
        )) as unknown as Record<string, unknown>;

        const response = coerceVerifySignupOtpPayload(raw);

        allowGuardRedirectsRef.current = false;

        if ('token' in response && typeof response.token === 'string' && response.token) {
          persistVerifiedSession(response);
          const role = (response.role === 'data_entry'
            ? 'data-entry'
            : response.role) as AppRole;

          navigate('/signup-success', {
            replace: true,
            state: {
              flow: 'session_ready',
              redirectTo: getRoleRoot(role),
              title: 'اكتمل التحقق',
              message: response.message,
            } satisfies SignupSuccessLocationState,
          });
          return;
        }

        const pendingState: SignupSuccessLocationState = {
          flow: 'pending_doctor',
          title: 'تم تأكيد رمز التسجيل',
          message: response.message,
        };

        navigate('/signup-success', { replace: true, state: pendingState });
      }}
    />
  );
}

export default function VerifyOtpPage() {
  return (
    <>
      <Helmet>
        <title>Verify OTP • LMJ Health</title>
      </Helmet>
      <AuthBackground>
        <Suspense fallback={null}>
          <VerifyOtpContent />
        </Suspense>
      </AuthBackground>
    </>
  );
}
