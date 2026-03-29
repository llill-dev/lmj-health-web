import { Helmet } from 'react-helmet-async';
import LoginForm from '@/components/auth/login/login-form';
import { useNavigate } from 'react-router-dom';
import AuthBackground from '@/components/auth/AuthBackground';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Login • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <LoginForm
          onBack={() => navigate('/welcome')}
          onSignUp={() => navigate('/signup')}
          onForgotPassword={() => navigate('/forgot-password')}
          onOtpLogin={() => navigate('/verify-otp')}
        />
      </AuthBackground>
    </>
  );
}
