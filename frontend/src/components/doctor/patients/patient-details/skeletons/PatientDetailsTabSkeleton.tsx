/**
 * Skeleton للتحميل داخل التبويبات
 */

import { useI18n } from "@/i18n/provider";

export function PatientDetailsTabSkeleton({ rows = 4 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">
        {t("doctor.patientDetailsSkeleton.loadingSection")}
      </span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#E8EDF3]/90 bg-gradient-to-l from-[#F8FAFC] via-white to-[#F4FAFB] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
        >
          <div className="h-4 max-w-[42%] animate-pulse rounded-md bg-[#E2E8F0]" />
          <div className="mt-3 h-3 max-w-[88%] animate-pulse rounded-md bg-[#EEF2F6]" />
          <div className="mt-2 h-3 max-w-[30%] animate-pulse rounded-md bg-[#F1F5F9]" />
        </div>
      ))}
    </div>
  );
}
