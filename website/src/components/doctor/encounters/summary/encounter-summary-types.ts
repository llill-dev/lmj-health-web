import type { LucideIcon } from 'lucide-react';

export type EncounterSummaryDiagnosisBadge = {
  label: string;
  tone: 'primary' | 'secondary' | 'danger' | 'warning';
};

export type EncounterSummaryDiagnosis = {
  id: string;
  title: string;
  badges: EncounterSummaryDiagnosisBadge[];
};

export type EncounterSummaryMedication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
};

export type EncounterSummaryOrderItem = {
  id: string;
  title: string;
  urgent?: boolean;
};

export type EncounterSummaryReferral = {
  id: string;
  specialty: string;
  doctorName: string;
  urgent?: boolean;
};

export type EncounterSummarySectionKey =
  | 'patient'
  | 'complaint'
  | 'history'
  | 'diagnosis'
  | 'medications'
  | 'labs'
  | 'radiology'
  | 'referrals';

export type EncounterSummarySectionMeta = {
  key: EncounterSummarySectionKey;
  title: string;
  icon: LucideIcon;
  count?: number;
};

export type EncounterSummaryViewModel = {
  patient: {
    name: string;
    ageLabel: string;
    fileNumber: string;
  };
  chiefComplaint: string;
  history: {
    currentIllness: string;
    pastIllnesses: string;
    medications: string;
  };
  diagnoses: EncounterSummaryDiagnosis[];
  medications: EncounterSummaryMedication[];
  labs: EncounterSummaryOrderItem[];
  radiology: EncounterSummaryOrderItem[];
  referrals: EncounterSummaryReferral[];
  closedAtLabel?: string;
};
