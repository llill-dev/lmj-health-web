import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import NewPassword from '@/components/auth/newPassword/new-password';
import AuthBackground from '@/components/auth/AuthBackground';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Forgot Password • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <NewPassword
          onBack={() => navigate('/login')}
          onSubmit={() => {
            navigate('/login');
          }}
        />
      </AuthBackground>
    </>
  );
}
