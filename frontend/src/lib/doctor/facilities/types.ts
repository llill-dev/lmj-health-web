import type { FacilityType } from "@/lib/admin/types";

export type DoctorFacilityStatus = "active" | "pending" | "closed";

export type DoctorFacility = {
  id: string;
  name: string;
  facilityType: FacilityType;
  description?: string;
  city: string;
  country?: string;
  address: string;
  phone: string;
  status: DoctorFacilityStatus;
  attributes?: string[];
  /** False when linked via PATCH assign to a catalog facility the doctor does not own. */
  isOwned?: boolean;
};

export type DoctorFacilityFormValues = {
  name: string;
  facilityType: FacilityType;
  description?: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  attributes?: string[];
};

export function getFacilityStatusLabels(
  t: (key: string) => string,
): Record<DoctorFacilityStatus, string> {
  return {
    active: t("doctor.facilities.status.active"),
    pending: t("doctor.facilities.status.pending"),
    closed: t("doctor.facilities.status.closed"),
  };
}

/** @deprecated Arabic-only — use getFacilityStatusLabels(t) for locale-aware labels. */
export const FACILITY_STATUS_LABELS: Record<DoctorFacilityStatus, string> = {
  active: "نشط",
  pending: "قيد المراجعة",
  closed: "غير نشط",
};

export function getFacilityTypeOptions(
  t: (key: string) => string,
): Array<{ value: FacilityType; label: string }> {
  return [
    { value: "clinic", label: t("doctor.facilities.type.clinic") },
    { value: "hospital", label: t("doctor.facilities.type.hospital") },
    { value: "polyclinic", label: t("doctor.facilities.type.polyclinic") },
    { value: "medical_center", label: t("doctor.facilities.type.medical_center") },
    { value: "laboratory", label: t("doctor.facilities.type.laboratory") },
    { value: "imaging_center", label: t("doctor.facilities.type.imaging_center") },
    { value: "pharmacy", label: t("doctor.facilities.type.pharmacy") },
    { value: "rehabilitation_center", label: t("doctor.facilities.type.rehabilitation_center") },
    { value: "dialysis_center", label: t("doctor.facilities.type.dialysis_center") },
    { value: "emergency_center", label: t("doctor.facilities.type.emergency_center") },
    { value: "other", label: t("doctor.facilities.type.other") },
  ];
}

/** @deprecated Arabic-only — use getFacilityTypeOptions(t) for locale-aware labels. */
export const DEFAULT_FACILITY_TYPE_OPTIONS: Array<{
  value: FacilityType;
  label: string;
}> = [
  { value: "clinic", label: "عيادة" },
  { value: "hospital", label: "مستشفى" },
  { value: "polyclinic", label: "عيادات متعددة" },
  { value: "medical_center", label: "مركز طبي" },
  { value: "laboratory", label: "مختبر" },
  { value: "imaging_center", label: "مركز أشعة" },
  { value: "pharmacy", label: "صيدلية" },
  { value: "rehabilitation_center", label: "مركز تأهيل" },
  { value: "dialysis_center", label: "مركز غسيل كلوي" },
  { value: "emergency_center", label: "طوارئ" },
  { value: "other", label: "أخرى" },
];
