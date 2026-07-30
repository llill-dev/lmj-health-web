import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import NewPassword from '@/components/auth/newPassword/new-password';
import { useToast } from '@/components/ui/ToastProvider';
import { authApi } from '@/lib/auth/client';
import {
  clearPasswordResetFlow,
  peekPasswordResetToken,
} from '@/lib/auth/passwordResetNavState';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n/provider';
import { getResetPasswordErrorMessage } from '@/lib/auth/authFlowErrors';

export default function ResetPasswordPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const tokenState = peekPasswordResetToken();

  if (!tokenState) {
    return <Navigate to='/forgot-password' replace />;
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.page.resetPassword.title')}</title>
      </Helmet>

      <NewPassword
        onSubmit={async (values) => {
          try {
            await authApi.setNewPassword({
              token: tokenState.resetToken,
              password: values.password,
            });

            clearPasswordResetFlow();
            await useAuthStore.getState().logout({ skipRemoteRevoke: true });

            navigate('/reset-password/success', { replace: true });
          } catch (error) {
            const message =
              getResetPasswordErrorMessage(error, locale) ||
              t('auth.resetPassword.error.fallback');
            toast(message, {
              title: t('auth.resetPassword.error.title'),
              variant: 'error',
              durationMs: 4800,
            });
            throw new Error(message);
          }
        }}
      />
    </>
  );
}
