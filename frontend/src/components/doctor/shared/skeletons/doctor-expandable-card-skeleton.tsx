'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorExpandableCardSkeleton({
  count = 3,
  expanded = false,
}: {
  count?: number;
  expanded?: boolean;
}) {
  const { t } = useI18n();
  return (
    <DoctorLoadingShell label={t('doctor.skeleton.expandableCards')}>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <article
            key={index}
            className="overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#EEF2F6] px-5 py-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-full" />
                <div className="space-y-2 text-start">
                  <SkeletonBlock className="h-5 w-36" />
                  <SkeletonBlock className="h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-6 w-20 rounded-full" />
                <SkeletonBlock className="h-8 w-8 rounded-[8px]" />
              </div>
            </div>
            {expanded && index === 0 ? (
              <div className="space-y-3 px-5 py-4">
                <SkeletonBlock className="h-4 w-full max-w-lg" />
                <SkeletonBlock className="h-4 w-[85%] max-w-md" />
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <SkeletonBlock className="h-9 w-28 rounded-[10px]" />
                  <SkeletonBlock className="h-9 w-28 rounded-[10px]" />
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </DoctorLoadingShell>
  );
}
