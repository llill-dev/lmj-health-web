import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import NewPassword from '@/components/auth/newPassword/new-password';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Reset Password • LMJ Health</title>
      </Helmet>

      <NewPassword
        onBack={() => navigate('/login')}
        onSubmit={() => {
          navigate('/login');
        }}
      />
    </>
  );
}
