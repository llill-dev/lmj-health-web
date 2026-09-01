import {
  formatPrescriptionHubDate,
  formatPrescriptionHubSystemId,
  resolvePrescriptionHubFacilityLabel,
} from "@/components/doctor/prescription/hub";
import type {
  DoctorPatientListItem,
  DoctorPatientMedicalRecord,
} from "@/lib/doctor/types";

export type MedicalRecordStatusKey =
  | "active"
  | "emergency"
  | "follow_up"
  | "closed"
  | "archived";

export type MedicalRecordRowVm = {
  id: string;
  patientId: string;
  systemId: string;
  patientName: string;
  patientPhone: string;
  diagnosis: string;
  facilityLabel: string;
  dateLabel: string;
  statusKey: MedicalRecordStatusKey;
  statusLabel: string;
  sortAt: string;
  raw: DoctorPatientMedicalRecord;
};

type TFn = (key: string, fallback?: string) => string;

export function resolveMedicalRecordStatus(
  record: DoctorPatientMedicalRecord,
  t: TFn,
): {
  key: MedicalRecordStatusKey;
  label: string;
} {
  const haystack =
    `${record.title ?? ""} ${record.diagnosis ?? ""}`.toLowerCase();

  if (haystack.includes("طار") || haystack.includes("emergency")) {
    return { key: "emergency", label: t("doctor.medicalRecords.status.emergency") };
  }

  if (record.followUpRequired) {
    return { key: "follow_up", label: t("doctor.medicalRecords.status.followUp") };
  }

  return { key: "active", label: t("doctor.medicalRecords.status.active") };
}

export function mapMedicalRecordToRow(
  patient: Pick<DoctorPatientListItem, "_id" | "publicId" | "user">,
  record: DoctorPatientMedicalRecord,
  facilityLabel: string,
  t: TFn,
): MedicalRecordRowVm {
  const dateSource = record.date ?? record.createdAt;
  const status = resolveMedicalRecordStatus(record, t);

  return {
    id: record._id,
    patientId: patient._id,
    systemId: formatPrescriptionHubSystemId({
      prescriptionId: record._id,
      patientPublicId: patient.publicId,
      date: dateSource,
    }),
    patientName:
      patient.user?.fullName?.trim() ||
      t("doctor.medicalRecords.fallback.patientName"),
    patientPhone: patient.user?.phone?.trim() || "—",
    diagnosis:
      record.diagnosis?.trim() ||
      record.title?.trim() ||
      t("doctor.medicalRecords.fallback.noDiagnosis"),
    facilityLabel,
    dateLabel: formatPrescriptionHubDate(dateSource),
    statusKey: status.key,
    statusLabel: status.label,
    sortAt: dateSource ?? record.createdAt ?? "",
    raw: record,
  };
}

export function matchesMedicalRecordSearch(
  row: MedicalRecordRowVm,
  search: string,
): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  return (
    row.patientName.toLowerCase().includes(q) ||
    row.patientPhone.toLowerCase().includes(q) ||
    row.diagnosis.toLowerCase().includes(q) ||
    row.systemId.toLowerCase().includes(q) ||
    row.facilityLabel.toLowerCase().includes(q)
  );
}

export { resolvePrescriptionHubFacilityLabel };
