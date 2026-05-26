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

export type EncounterWorkspaceSectionViewModel = {
  key: EncounterWorkspaceSectionKey;
  count: number;
  status: EncounterWorkspaceSectionStatus;
  footerHint: string;
  statusLabel: string;
  defaultExpanded?: boolean;
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
