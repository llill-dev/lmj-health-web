'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/utils';

export const DOCTOR_SKELETON_PULSE =
  'animate-pulse rounded-md bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]';

export function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return <div className={cn(DOCTOR_SKELETON_PULSE, className)} aria-hidden />;
}

export function DoctorLoadingShell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(className)}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
