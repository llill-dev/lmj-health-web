'use client';

import { useRouter } from 'next/navigation';
import NewPassword from '@/components/auth/newPassword/new-password';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <NewPassword
      onBack={() => router.push('/login')}
      onSubmit={() => {
        router.push('/login');
      }}
    />
  );
}
