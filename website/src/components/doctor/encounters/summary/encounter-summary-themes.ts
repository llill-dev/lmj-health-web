import type { EncounterSummarySectionKey } from './encounter-summary-types';

/** Header bar background per section (replaces default #F8FFFE). */
export const ENCOUNTER_SUMMARY_HEADER_BG: Record<
  EncounterSummarySectionKey,
  string
> = {
  patient: '#E6F4F3',
  complaint: '#E6F4F3',
  history: '#EFF6FF',
  diagnosis: '#E6F4F3',
  medications: '#E6F4F3',
  labs: '#E9D4FF',
  radiology: '#B9F8CF',
  referrals: '#E6F4F3',
};
