'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorNotificationListSkeleton({ rows = 5 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <DoctorLoadingShell label={t('doctor.skeleton.notifications')}>
      <div className="divide-y divide-[#EEF2F6] rounded-[14px] border border-[#E2E8F0] bg-white">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 px-5 py-4">
            <SkeletonBlock className="mt-1 h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 text-start">
              <SkeletonBlock className="h-4 w-3/4 max-w-sm" />
              <SkeletonBlock className="h-3 w-full max-w-md" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </DoctorLoadingShell>
  );
}
