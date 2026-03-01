'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login/login-form';

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onBack={() => router.push('/welcome')}
      onSignUp={() => router.push('/signup')}
      onForgotPassword={() => router.push('/forgot-password')}
      onOtpLogin={() => router.push('/verify-otp')}
    />
  );
}
