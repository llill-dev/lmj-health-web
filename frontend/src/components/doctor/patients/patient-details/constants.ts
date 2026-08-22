/**
 * ثوابت ومتغيرات صفحة تفاصيل المريض
 */

import type { TabConfig } from "./types";

export const TABS: TabConfig[] = [
  { id: "basic", label: "نظرة عامة" },
  { id: "timeline", label: "الخط الزمني" },
  { id: "history", label: "السجل الطبي" },
  { id: "encounters", label: "الزيارات الطبية" },
  { id: "medications", label: "الأدوية" },
  { id: "prescriptions", label: "الوصفات الطبية" },
  { id: "tests", label: "الطلبات الطبية" },
  { id: "files", label: "الملفات" },
  { id: "documents", label: "الوثائق السريرية" },
  { id: "appointments", label: "المواعيد" },
];

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
