'use client';

import { SkeletonBlock } from './doctor-skeleton-primitives';
import { useI18n } from '@/i18n/provider';

export function DoctorInlineDetailsSkeleton({ rows = 3 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div
      className="space-y-2 rounded-[12px] border border-dashed border-primary/20 bg-[#F8FFFE] px-4 py-3"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{t('doctor.skeleton.inlineDetails')}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={`h-3 ${index === rows - 1 ? 'w-[70%]' : 'w-full'}`}
        />
      ))}
    </div>
  );
}
