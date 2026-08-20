import { Helmet } from 'react-helmet-async';
import LoginForm from '@/components/auth/login/login-form';
import { useNavigate } from 'react-router-dom';
import AuthBackground from '@/components/auth/AuthBackground';
import { useI18n } from '@/i18n/provider';

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{t('auth.page.login.title')}</title>
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
