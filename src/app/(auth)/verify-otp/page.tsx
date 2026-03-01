'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VerifyAccount from '@/components/auth/verify/verify-account';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'Ahmad@gmail.com';

  return (
    <VerifyAccount
      email={email}
      onBack={() => router.back()}
      onVerify={() => {
        router.push('/login');
      }}
    />
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}
