'use client';

import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/auth/signUp/signup-form';

export default function SignupPage() {
  const router = useRouter();

  return (
    <SignUpForm
      onBack={() => router.push('/welcome')}
      onLogin={() => router.push('/login')}
      onVerify={() => router.push('/verify-otp')}
      onSuccess={() => router.push('/signup-success')}
    />
  );
}
