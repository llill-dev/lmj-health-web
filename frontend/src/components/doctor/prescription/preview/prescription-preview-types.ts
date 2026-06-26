import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';

export type PrescriptionPreviewMedicationVm = {
  id: string;
  index: number;
  name: string;
  concentration: string;
  usage: string;
  /** تعليمات بند الدواء من API — تُعرض فقط عند وجود قيمة */
  instructions?: string;
  frequency: string;
  duration: string;
};

export type PrescriptionPreviewVm = {
  prescriptionId: string;
  prescriptionCode: string;
  patientName: string;
  patientMeta: string;
  patientPhone: string;
  doctorName: string;
  generalInstructions?: string;
  medications: PrescriptionPreviewMedicationVm[];
  statusLabel: string;
  canFinalize: boolean;
  raw: EncounterPrescriptionRecord;
};
