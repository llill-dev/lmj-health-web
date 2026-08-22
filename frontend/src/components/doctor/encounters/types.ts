export type MedicalVisitStatusFilter = "all" | "open" | "closed";

export type MedicalVisitStatus = "open" | "closed";

export type MedicalVisitDraft = {
  id: string;
  code: string;
  updatedAtLabel: string;
  prescriptionsCount: number;
  labTestsCount: number;
  imagingCount: number;
};

export type MedicalVisitCardData = {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number | null;
  fileNumber: string;
  visitTypeLabel: string;
  status: MedicalVisitStatus;
  origin?: string;
  notes?: string;
  startedAtLabel: string;
  closedAtLabel?: string;
  appointmentAtLabel: string;
  listDateLabel: string;
  listTimeLabel: string;
  listTimePeriodLabel: string;
  appointmentTypeName?: string | null;
  linkedAppointment?: {
    date: string;
    time: string;
  } | null;
  drafts: MedicalVisitDraft[];
};

export type EncountersFiltersState = {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "startedAt" | "createdAt";
  sortOrder: "asc" | "desc";
  status: MedicalVisitStatusFilter;
};
