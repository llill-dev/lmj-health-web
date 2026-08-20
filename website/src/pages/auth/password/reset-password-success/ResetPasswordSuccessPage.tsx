import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ResetPasswordSuccess from '@/components/auth/password/ResetPasswordSuccess';
import { clearPasswordResetFlow } from '@/lib/auth/passwordResetNavState';

export default function ResetPasswordSuccessPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Reset Password Success • LMJ Health</title>
      </Helmet>

      <ResetPasswordSuccess
        onLogin={() => navigate('/login', { replace: true })}
        onResetAnother={() => {
          clearPasswordResetFlow();
          navigate('/forgot-password', { replace: true });
        }}
      />
    </>
  );
}
