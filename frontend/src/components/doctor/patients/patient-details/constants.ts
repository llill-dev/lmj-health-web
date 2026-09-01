/**
 * ثوابت ومتغيرات صفحة تفاصيل المريض
 */

import type { TabConfig } from "./types";

export function getPatientDetailsTabs(
  t: (key: string, fallback?: string) => string,
): TabConfig[] {
  return [
    { id: "basic", label: t("doctor.patientDetailsTabs.basic") },
    { id: "timeline", label: t("doctor.patientDetailsTabs.timeline") },
    { id: "history", label: t("doctor.patientDetailsTabs.history") },
    { id: "encounters", label: t("doctor.patientDetailsTabs.encounters") },
    { id: "medications", label: t("doctor.patientDetailsTabs.medications") },
    {
      id: "prescriptions",
      label: t("doctor.patientDetailsTabs.prescriptions"),
    },
    { id: "tests", label: t("doctor.patientDetailsTabs.tests") },
    { id: "files", label: t("doctor.patientDetailsTabs.files") },
    { id: "documents", label: t("doctor.patientDetailsTabs.documents") },
    {
      id: "appointments",
      label: t("doctor.patientDetailsTabs.appointments"),
    },
  ];
}

export const TAB_PANEL_TRANSITION = {
  duration: 0.34,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const TAB_STAGGER_CONTAINER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.052, delayChildren: 0.05 },
  },
};

export const TAB_STAGGER_ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
  },
};
