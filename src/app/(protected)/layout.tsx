import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen'>
      <header className='sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-6'>
          <div className='text-sm font-medium'>LMJ Health</div>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
