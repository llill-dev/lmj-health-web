'use client';

import { useI18n } from '@/i18n/provider';

const PULSE =
  'animate-pulse rounded-md bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]';

function PatientCardSkeleton() {
  return (
    <article
      className="relative overflow-hidden rounded-[14px] border border-[#BFEDEC] bg-[#F0FAF9] px-5 py-5"
      aria-hidden
    >
      <div className={`absolute start-4 top-4 h-6 w-16 ${PULSE} rounded-full`} />
      <div className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-start gap-3">
          <div className={`h-10 w-10 shrink-0 rounded-full ${PULSE}`} />
          <div className="space-y-2 text-start">
            <div className={`h-6 w-40 ${PULSE}`} />
            <div className={`h-4 w-28 ${PULSE}`} />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <div className={`h-[52px] w-[120px] rounded-[10px] ${PULSE}`} />
          <div className={`h-[52px] w-[120px] rounded-[10px] ${PULSE}`} />
        </div>
      </div>
    </article>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={`h-12 w-full rounded-[12px] ${PULSE}`} />
        <div className={`h-12 w-full rounded-[12px] ${PULSE}`} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={`h-11 w-full rounded-[12px] ${PULSE}`} />
        <div className={`h-11 w-full rounded-[12px] ${PULSE}`} />
        <div className={`h-11 w-full rounded-[12px] ${PULSE}`} />
      </div>
    </div>
  );
}

export function EncounterWorkspaceSectionSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]"
      aria-hidden
    >
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-[10px] ${PULSE}`} />
            <div className={`h-5 w-32 ${PULSE}`} />
          </div>
          <div className={`h-6 w-14 rounded-full ${PULSE}`} />
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5">
        <div className={`h-4 w-full max-w-md ${PULSE}`} />
        <div className={`h-4 w-[80%] max-w-sm ${PULSE}`} />
        <div className={`h-9 w-28 rounded-[10px] ${PULSE}`} />
      </div>
    </article>
  );
}

/** هيكل كامل للزيارة أثناء انتظار تفاصيل الزيارة من الخادم */
export function EncounterWorkspacePageSkeleton() {
  const { t } = useI18n();
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{t('doctor.encounterWorkspace.skeleton.loadingWorkspace')}</span>
      <PatientCardSkeleton />
      <QuickActionsSkeleton />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <EncounterWorkspaceSectionSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
        <div className={`h-12 w-full rounded-[12px] ${PULSE}`} />
        <div className={`h-12 w-full rounded-[12px] ${PULSE}`} />
      </div>
    </div>
  );
}

/** أقسام فقط — بعد ظهور بطاقة المريض والأزرار */
export function EncounterWorkspaceSectionsSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('doctor.encounterWorkspace.skeleton.loadingSections')}</span>
      {Array.from({ length: count }).map((_, index) => (
        <EncounterWorkspaceSectionSkeleton key={index} />
      ))}
    </div>
  );
}
