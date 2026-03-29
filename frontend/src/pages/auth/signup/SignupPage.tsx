import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SignUpForm from '@/components/auth/signUp/signup-form';
import AuthBackground from '@/components/auth/AuthBackground';

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Signup • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <SignUpForm
          onBack={() => navigate('/welcome')}
          onLogin={() => navigate('/login')}
          onVerify={() => navigate('/verify-otp')}
          onSuccess={() => navigate('/signup-success')}
        />
      </AuthBackground>
    </>
  );
}
