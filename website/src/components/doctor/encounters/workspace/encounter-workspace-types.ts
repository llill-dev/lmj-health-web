import type { LucideIcon } from 'lucide-react';

export type EncounterWorkspaceSectionStatus =
  | 'draft'
  | 'approved'
  | 'empty';

export type EncounterWorkspaceSectionKey =
  | 'prescription'
  | 'lab'
  | 'radiology'
  | 'procedure'
  | 'referral';

export type EncounterWorkspaceSectionTheme = {
  icon: LucideIcon;
  title: string;
  iconWrapClass: string;
  iconClass: string;
  borderClass: string;
  headerClass: string;
  panelClass: string;
  countClass: string;
  footerDotClass: string;
  statusDraftClass: string;
  statusApprovedClass: string;
  statusEmptyClass: string;
};

export type EncounterWorkspaceLineItem = {
  id: string;
  title: string;
  subtitle?: string;
  statusLabel: string;
  urgency?: 'urgent' | 'normal';
};

export type EncounterWorkspaceSectionViewModel = {
  key: EncounterWorkspaceSectionKey;
  count: number;
  status: EncounterWorkspaceSectionStatus;
  footerHint: string;
  statusLabel: string;
  defaultExpanded?: boolean;
  items: EncounterWorkspaceLineItem[];
  /** للتحويلات: نفس البيانات مع حقول إضافية للعرض */
  referrals?: Array<{
    id: string;
    code: string;
    doctorName: string;
    specialty: string;
    urgency?: 'urgent' | 'normal';
    statusLabel: string;
  }>;
};

export type EncounterWorkspacePatientViewModel = {
  name: string;
  ageLabel: string;
  fileNumber: string;
  statusLabel: string;
  isActive: boolean;
  startedLabel: string;
  appointmentTimeLabel: string;
  linkedAppointmentDate: string;
  linkedAppointmentTime: string;
};

export const ENCOUNTER_WORKSPACE_SECTION_PATHS: Record<
  EncounterWorkspaceSectionKey,
  (patientId: string, encounterId: string) => string
> = {
  prescription: (patientId, encounterId) =>
    `/doctor/encounters/${patientId}/${encounterId}/prescription`,
  lab: (patientId, encounterId) =>
    `/doctor/encounters/${patientId}/${encounterId}/lab`,
  radiology: (patientId, encounterId) =>
    `/doctor/encounters/${patientId}/${encounterId}/radiology`,
  procedure: (patientId, encounterId) =>
    `/doctor/encounters/${patientId}/${encounterId}/procedure`,
  referral: (patientId, encounterId) =>
    `/doctor/encounters/${patientId}/${encounterId}/referral`,
};
