'use client';

import { DoctorLoadingShell, SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorPageHeaderSkeleton({
  withAction = true,
}: {
  withAction?: boolean;
}) {
  const { t } = useI18n();
  return (
    <DoctorLoadingShell label={t('doctor.skeleton.pageHeader')}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 text-start">
          <SkeletonBlock className="h-8 w-48 sm:w-56" />
          <SkeletonBlock className="h-4 w-64 max-w-full" />
        </div>
        {withAction ? <SkeletonBlock className="h-11 w-36 rounded-[10px]" /> : null}
      </div>
    </DoctorLoadingShell>
  );
}
