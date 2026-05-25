import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthBackground from '@/components/auth/AuthBackground';
import NewPassword from '@/components/auth/newPassword/new-password';
import { useToast } from '@/components/ui/ToastProvider';
import { authApi } from '@/lib/auth/client';
import {
  clearPasswordResetFlow,
  peekPasswordResetToken,
} from '@/lib/auth/passwordResetNavState';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const tokenState = peekPasswordResetToken();

  if (!tokenState) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Reset Password • LMJ Health</title>
      </Helmet>

      <AuthBackground>
        <NewPassword
          onBack={() => navigate('/reset-password/verify')}
          onSubmit={async (values) => {
            try {
              await authApi.setNewPassword({
                token: tokenState.resetToken,
                password: values.password,
              });

              clearPasswordResetFlow();
              await useAuthStore.getState().logout({ skipRemoteRevoke: true });

              toast('تم حفظ كلمة المرور الجديدة. يمكنك تسجيل الدخول الآن.', {
                title: 'تم',
                variant: 'success',
                durationMs: 4200,
              });

              navigate('/login', { replace: true });
            } catch (error) {
              const message =
                error instanceof ApiError
                  ? error.message
                  : 'تعذّر حفظ كلمة المرور. حاول مجدداً.';
              toast(message, {
                title: 'تعذّر التحديث',
                variant: 'error',
                durationMs: 4800,
              });
            }
          }}
        />
      </AuthBackground>
    </>
  );
}
