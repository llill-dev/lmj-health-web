'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/utils';

export function DoctorProfileFormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-start font-cairo text-[12px] font-extrabold text-[#344054]">
        {label}
        {required ? <span className="text-[#F04438]"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          className="text-start font-cairo text-[11px] font-bold text-[#D92D20]"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-start font-cairo text-[11px] font-semibold text-[#667085]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const profileFieldSurfaceClass =
  'border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3]';

export const profileInputClass =
  `h-[48px] w-full rounded-[12px] ${profileFieldSurfaceClass} px-4 font-cairo text-[13px] font-bold text-[#101828] outline-none transition placeholder:font-semibold placeholder:text-[#98A2B3] focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_rgba(15,143,139,0.11)]`;

export const profileInputInvalidClass =
  'border-[#F04438] bg-[#FFFBFB] shadow-[inset_0_1px_2px_rgba(240,68,56,0.06)] focus-visible:border-[#F04438] focus-visible:shadow-[0_0_0_4px_rgba(240,68,56,0.12)]';

export const profileTextareaClass =
  `min-h-[96px] w-full resize-y rounded-[12px] ${profileFieldSurfaceClass} px-4 py-3 font-cairo text-[13px] font-bold text-[#101828] outline-none transition placeholder:font-semibold placeholder:text-[#98A2B3] focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_rgba(15,143,139,0.11)]`;

export function profileFieldClass(base: string, hasError?: boolean) {
  return cn(base, hasError && profileInputInvalidClass);
}
