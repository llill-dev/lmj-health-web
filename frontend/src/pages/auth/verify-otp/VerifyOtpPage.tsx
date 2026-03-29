import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VerifyAccount from '@/components/auth/verify/verify-account';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth/client';
import AuthBackground from '@/components/auth/AuthBackground';

function VerifyOtpContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pending = useAuthStore((s) => s.pendingVerification);
  const email = pending?.email ?? searchParams.get('email') ?? '';

  return (
    <VerifyAccount
      email={email}
      onBack={() => navigate(-1)}
      onResend={async () => {
        if (!pending) return;

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
      onVerify={() => {
        navigate('/login');
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
