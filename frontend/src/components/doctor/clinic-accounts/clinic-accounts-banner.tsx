'use client';

import type { ReactNode } from 'react';

export function ClinicAccountsBanner({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[6px] px-6 py-7 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat opacity-90"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        {action ? <div className="shrink-0">{action}</div> : <div />}
        <div className="flex min-w-0 flex-1 items-start justify-end gap-4 text-right">
          <div className="min-w-0">
            <h1 className="font-cairo text-[26px] font-black leading-[32px] text-primary sm:text-[30px] sm:leading-[36px]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 font-cairo text-[14px] font-bold leading-[22px] text-primary/90 sm:text-[16px]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)] sm:h-16 sm:w-16">
            {icon}
          </div>
        </div>
      </div>
    </section>
  );
}
