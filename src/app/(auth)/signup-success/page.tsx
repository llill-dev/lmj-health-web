'use client';

import { useRouter } from 'next/navigation';
import SignupSuccess from '@/components/auth/signUp/signup-success';

export default function SignupSuccessPage() {
  const router = useRouter();

  return <SignupSuccess onContinue={() => router.push('/verify-otp')} />;
}
