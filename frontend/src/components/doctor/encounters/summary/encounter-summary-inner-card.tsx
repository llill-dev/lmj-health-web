import type { EncounterSummarySectionKey } from './encounter-summary-types';
import { ENCOUNTER_SUMMARY_HEADER_BG } from './encounter-summary-themes';
import { cn } from '@/lib/utils/utils';

export function encounterSummaryInnerCardStyle(
  sectionKey: EncounterSummarySectionKey,
) {
  const color = ENCOUNTER_SUMMARY_HEADER_BG[sectionKey];
  return {
    backgroundColor: color,
    borderColor: color,
  } as const;
}

export function EncounterSummaryInnerCard({
  sectionKey,
  className,
  children,
}: {
  sectionKey: EncounterSummarySectionKey;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] border-[0.5px] px-4 py-3',
        className,
      )}
      style={encounterSummaryInnerCardStyle(sectionKey)}
    >
      {children}
    </div>
  );
}
