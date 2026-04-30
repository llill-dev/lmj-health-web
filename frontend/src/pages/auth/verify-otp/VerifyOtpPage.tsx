import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import VerifyAccount from '@/components/auth/verify/verify-account';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth/client';
import AuthBackground from '@/components/auth/AuthBackground';
import { writeAuthToken, writeAuthUser } from '@/lib/cookies';
import { getRoleRoot, type AppRole } from '@/routes/ProtectedRoute';
import type { VerifySignupOtpResponse } from '@/lib/auth/types';

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
    ),
    patientPublicId: response.patientPublicId,
  });
}

function VerifyOtpContent() {
  const navigate = useNavigate();
  const pending = useAuthStore((s) => s.pendingVerification);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!pending) {
    if (token && user?.role) {
      return <Navigate to={getRoleRoot(user.role as AppRole)} replace />;
    }
    return <Navigate to='/signup' replace />;
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
        const response = await authApi.verifySignupOtp(
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
        );

        useAuthStore.getState().setPendingVerification(null);

        if ('token' in response) {
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
            },
          });
          return;
        }

        navigate('/signup-success', {
          replace: true,
          state: {
            flow: 'pending_doctor',
            title: 'تم تأكيد رمز التسجيل',
            message: response.message,
          },
        });
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
