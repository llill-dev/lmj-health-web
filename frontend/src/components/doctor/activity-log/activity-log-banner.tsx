'use client';

import { List } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function ActivityLogBanner() {
  const { t } = useI18n();
  return (
    <section className="relative mb-5 overflow-hidden rounded-[12px] bg-primary px-6 py-7 shadow-[0_14px_30px_rgba(15,143,139,0.28)] sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-20"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-white backdrop-blur-sm">
          <List className="h-7 w-7" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 text-start">
          <h1 className="font-cairo text-[26px] font-black leading-[32px] text-white sm:text-[30px]">
            {t('doctor.activityLog.banner.title')}
          </h1>
          <p className="mt-1 font-cairo text-[14px] font-bold leading-[22px] text-white/90 sm:text-[15px]">
            {t('doctor.activityLog.banner.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
}
