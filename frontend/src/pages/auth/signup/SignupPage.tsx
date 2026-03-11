import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import SignUpForm from '@/components/auth/signUp/signup-form';

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Signup • LMJ Health</title>
      </Helmet>

      <SignUpForm
        onBack={() => navigate('/welcome')}
        onLogin={() => navigate('/login')}
        onVerify={() => navigate('/verify-otp')}
        onSuccess={() => navigate('/signup-success')}
      />
    </>
  );
}
