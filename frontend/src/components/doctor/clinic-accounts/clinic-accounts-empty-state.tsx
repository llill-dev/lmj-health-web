'use client';

import type { ReactNode } from 'react';

type ClinicAccountsEmptyStateProps = {
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};

export function ClinicAccountsEmptyState({
  title,
  subtitle,
  imageSrc = '/images/photo-not-found_appotemint.png',
  imageAlt = '',
  actionLabel,
  onAction,
  actionIcon,
}: ClinicAccountsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center rounded-[16px] border border-[#EEF2F6] bg-white px-6 py-14 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="mb-8 flex w-full max-w-[280px] justify-center sm:max-w-[320px]">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="object-contain w-full h-auto select-none"
          width={320}
          height={280}
          loading="lazy"
          decoding="async"
        />
      </div>

      <h3 className="font-cairo text-[17px] font-bold leading-[28px] text-[#101828] sm:text-[18px]">
        {title}
      </h3>

      <p className="mt-3 max-w-[360px] font-cairo text-[14px] font-semibold leading-[22px] text-[#667085]">
        {subtitle}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-8 inline-flex min-h-[48px] min-w-[180px] items-center justify-center gap-2 rounded-[12px] bg-primary px-8 font-cairo text-[15px] font-bold text-white shadow-[0px_12px_24px_-4px_rgba(15,143,139,0.35)] transition-colors hover:bg-[#14B3AE]"
        >
          {actionIcon ? (
            <span className="shrink-0" aria-hidden>
              {actionIcon}
            </span>
          ) : null}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
