'use client';

import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#d7f6f1_0%,#c5f0e9_35%,#baeae2_65%,#b6efe7_100%)]'>
      <div className='pointer-events-none absolute -left-24 top-20 h-80 w-80 rotate-[-12deg] rounded-3xl bg-white/10 blur-2xl' />
      <div className='pointer-events-none absolute -right-40 bottom-10 h-[28rem] w-[28rem] rotate-[12deg] rounded-[3rem] bg-white/10 blur-2xl' />
      <div className='relative z-10 mx-auto flex min-h-screen w-full max-w-[1120px] items-center justify-center px-4 py-10'>
        {children}
      </div>
    </main>
  );
}
