'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

export default function DoctorProfileInfoBanner({
  children,
  tone = 'info',
  className,
}: {
  children: React.ReactNode;
  tone?: 'info' | 'warning';
  className?: string;
}) {
  const isWarning = tone === 'warning';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[10px] border px-4 py-3',
        isWarning
          ? 'border-[#FDE68A] bg-[#FFFBEB]'
          : 'border-[#B2DFDB] bg-[#E6F4F3]',
        className,
      )}
    >
      <Info
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          isWarning ? 'text-[#D97706]' : 'text-primary',
        )}
        aria-hidden
      />
      <p
        className={cn(
          'text-start font-cairo text-[12px] font-semibold leading-[20px]',
          isWarning ? 'text-[#92400E]' : 'text-[#0F766E]',
        )}
      >
        {children}
      </p>
    </div>
  );
}
