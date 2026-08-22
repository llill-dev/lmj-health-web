'use client';

import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils/utils';

/**
 * Shared back control for doctor pages that don't sit inside a tabbed workspace
 * (draft-visit document previews, profile edit forms). Falls back to a given route
 * when there's no browser history to go back to (e.g. the page was opened directly).
 */
export function DoctorPageBackButton({
  fallbackTo,
  className,
}: {
  fallbackTo: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const { dir } = useI18n();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:border-primary hover:text-primary',
        className,
      )}
    >
      <ArrowRight className={cn('h-4 w-4', dir === 'ltr' && 'rotate-180')} aria-hidden />
      رجوع
    </button>
  );
}
