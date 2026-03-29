import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SignupSuccess from '@/components/auth/signUp/signup-success';
import AuthBackground from '@/components/auth/AuthBackground';

export default function SignupSuccessPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Signup Success • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <SignupSuccess onContinue={() => navigate('/verify-otp')} />
      </AuthBackground>
    </>
  );
}
