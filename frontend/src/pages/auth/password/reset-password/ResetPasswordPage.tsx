import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import NewPassword from '@/components/auth/newPassword/new-password';
import { useToast } from '@/components/ui/ToastProvider';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <>
      <Helmet>
        <title>Reset Password • LMJ Health</title>
      </Helmet>

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
    </>
  );
}
