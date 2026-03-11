import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VerifyAccount from '@/components/auth/verify/verify-account';

function VerifyOtpContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? 'Ahmad@gmail.com';

  return (
    <VerifyAccount
      email={email}
      onBack={() => navigate(-1)}
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
      <Suspense fallback={null}>
        <VerifyOtpContent />
      </Suspense>
    </>
  );
}
