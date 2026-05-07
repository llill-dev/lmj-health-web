import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import NewPassword from '@/components/auth/newPassword/new-password';
import AuthBackground from '@/components/auth/AuthBackground';
import { useToast } from '@/components/ui/ToastProvider';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <>
      <Helmet>
        <title>Forgot Password • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <NewPassword
          onBack={() => navigate('/login')}
          onSubmit={() => {
            toast('تم حفظ كلمة المرور الجديدة. يمكنك تسجيل الدخول الآن.', {
              title: 'تم',
              variant: 'success',
              durationMs: 4200,
            });
            navigate('/login');
          }}
        />
      </AuthBackground>
    </>
  );
}
