import { Helmet } from "react-helmet-async";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  Link2,
  Loader2,
  Phone,
  Pill,
  Plus,
  Printer,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Upload,
  UserCheck,
  UserRound,
  Users,
  type LucideIcon,
  Calendar,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { DoctorPatientExpandableCardData } from "@/components/doctor/patients/doctor-patient-expandable-card";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useDeleteDoctorPatientFile,
  useDoctorPatientEncounters,
  useDoctorPatientFiles,
  useDoctorPatientFullProfile,
  useDoctorPatientPublicProfile,
  useRequestDoctorPatientAccess,
  useUploadDoctorPatientFile,
} from "@/hooks";
import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { readAuthUser } from "@/lib/cookies";
import { doctorApi } from "@/lib/doctor/client";
import {
  determinePatientState,
  getPatientStateInfo,
  getStateMessage,
} from "@/lib/doctor/patient-states";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import { cn } from "@/lib/utils/utils";

type FullProfileData = {
  medicalHistory: Array<{
    id: string;
    title: string;
    diagnosis: string;
    date: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }>;
  prescriptions: Array<{
    id: string;
    status: string;
    createdAt: string;
    items: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
    }>;
    notes?: string;
  }>;
  files: Array<{ id: string; name: string; createdAt: string }>;
  orders: Array<{ id: string; title: string; status: string }>;
};

type PatientDetailsTab =
  | "basic"
  | "history"
  | "encounters"
  | "medications"
  | "prescriptions"
  | "tests"
  | "files"
  | "documents"
  | "appointments"
  | "timeline";

const TABS: { id: PatientDetailsTab; label: string }[] = [
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

const TAB_PANEL_TRANSITION = {
  duration: 0.34,
  ease: [0.16, 1, 0.3, 1] as const,
};

const TAB_STAGGER_CONTAINER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.052, delayChildren: 0.05 },
  },
};

const TAB_STAGGER_ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function PatientDetailsTabSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">جارٍ تحميل محتوى القسم…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#E8EDF3]/90 bg-gradient-to-l from-[#F8FAFC] via-white to-[#F4FAFB] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
        >
          <div className="h-4 max-w-[42%] animate-pulse rounded-md bg-[#E2E8F0]" />
          <div className="mt-3 h-3 max-w-[88%] animate-pulse rounded-md bg-[#EEF2F6]" />
          <div className="mt-2 h-3 max-w-[30%] animate-pulse rounded-md bg-[#F1F5F9]" />
        </div>
      ))}
    </div>
  );
}

function PatientHeaderSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/95 bg-white shadow-[0_28px_64px_-18px_rgba(15,143,139,0.14),0_8px_24px_rgba(15,23,42,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#5eead4] via-primary to-[#0f766e]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 65% at 100% 0%, rgba(15,143,139,0.11), transparent 52%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(20,184,166,0.09), transparent 48%), linear-gradient(165deg, #ffffff 0%, #f8fdfc 42%, #f1faf9 100%)",
        }}
      />

      <div
        className="relative px-5 py-7 sm:px-8 sm:py-8"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">جارٍ تحميل تفاصيل المريض…</span>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-1 gap-5 items-start min-w-0 sm:gap-6">
            <div className="h-[76px] w-[76px] animate-pulse rounded-[22px] bg-gradient-to-br from-[#E5E7EB] to-[#F3F4F6]" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-3 w-24 animate-pulse rounded-md bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
              <div className="h-7 w-48 animate-pulse rounded-lg bg-gradient-to-r from-[#D1D5DB] to-[#E5E7EB]" />
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-28 animate-pulse rounded-xl bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-auto lg:grid-cols-2">
            <div className="h-[110px] animate-pulse rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]" />
            <div className="h-[110px] animate-pulse rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MedicalHistoryRecordCard({
  record,
  index,
}: {
  record: FullProfileData["medicalHistory"][number];
  index: number;
}) {
  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-white shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.017]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 100% 0%, rgba(15,143,139,0.06), transparent 50%), radial-gradient(circle at 0% 100%, rgba(20,184,166,0.05), transparent 42%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-5 right-0 w-[3px] rounded-full bg-gradient-to-b from-primary via-[#14b8a6] to-[#0f766e] opacity-95 shadow-[0_0_12px_rgba(15,143,139,0.35)]"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex gap-3 justify-between items-start shrink-0 sm:flex-col sm:items-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-br from-primary/14 via-[#ecfdf9] to-white text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(15,143,139,0.12)] ring-1 ring-primary/12">
              <ClipboardList
                className="h-[22px] w-[22px]"
                strokeWidth={2.25}
                aria-hidden
              />
            </div>
            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 font-cairo text-[11px] font-black tabular-nums text-[#64748b] ring-1 ring-[#E2E8F0] sm:hidden">
              #{index}
            </span>
          </div>

          <div className="flex-1 space-y-3 min-w-0 text-right">
            <div className="flex flex-wrap gap-3 justify-between items-start">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap gap-2 justify-start items-center">
                  <span className="hidden font-cairo text-[11px] font-black tabular-nums text-[#94a3b8] sm:inline">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#ecfdf9] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/18">
                    سجل سريري
                  </span>
                </div>
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {record.title}
                </h3>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#E8EDF3]/95 bg-[linear-gradient(145deg,#fafefd_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="mb-1.5 flex items-center justify-start gap-2">
                <span className="hidden font-cairo text-[11px] font-black tabular-nums text-[#94a3b8] sm:inline">
                  #{index}
                </span>
                <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                  التشخيص والملاحظات السريرية
                </span>
              </div>
              <p className="font-cairo text-[13px] font-semibold leading-[1.65] text-[#334155]">
                {record.diagnosis}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/90 bg-[#F8FAFC]/95 px-3.5 py-2 font-cairo text-[12px] font-bold tabular-nums text-[#475569] shadow-[0_4px_12px_rgba(15,23,42,0.04)] backdrop-blur-[2px]">
                <CalendarDays
                  className="w-4 h-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{record.date}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MedicalOrderCard({
  order,
  index,
}: {
  order: FullProfileData["orders"][number];
  index: number;
}) {
  const statusStyles = {
    pending: {
      bg: "bg-[#FEF3C7]/80",
      text: "text-[#92400E]",
      ring: "ring-[#FDE68A]/60",
      label: "قيد الانتظار",
    },
    completed: {
      bg: "bg-[#D1FAE5]/80",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/60",
      label: "مكتمل",
    },
    cancelled: {
      bg: "bg-[#FEE2E2]/80",
      text: "text-[#991B1B]",
      ring: "ring-[#FCA5A5]/60",
      label: "ملغى",
    },
    in_progress: {
      bg: "bg-[#DBEAFE]/80",
      text: "text-[#1E40AF]",
      ring: "ring-[#93C5FD]/60",
      label: "جارٍ التنفيذ",
    },
  };

  const currentStatus = statusStyles[
    order.status as keyof typeof statusStyles
  ] ?? {
    bg: "bg-[#F3F4F6]/80",
    text: "text-[#374151]",
    ring: "ring-[#D1D5DB]/60",
    label: order.status || "غير محدد",
  };

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E8EDF3]/95 bg-[linear-gradient(165deg,#fffbeb_0%,#ffffff_42%,#f0fdf4_100%)] shadow-[0_16px_42px_-14px_rgba(234,179,8,0.08),0_10px_28px_rgba(15,143,139,0.06)] ring-1 ring-[#fef3c7]/40"
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#EAB308]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex-1 min-w-0 text-right">
            <div className="flex gap-3 justify-start items-start shrink-0">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#fef3c7] via-white to-[#ecfdf9] text-[#CA8A04] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(234,179,8,0.1)] ring-1 ring-[#FDE68A]/70">
                <Activity
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 justify-start items-center mb-2">
                  <span className="font-cairo text-[11px] font-black tabular-nums text-[#94a3b8]">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#fef9c3] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-[#854D0E] ring-1 ring-[#FDE047]/40">
                    طلب طبي
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1",
                      currentStatus.bg,
                      currentStatus.text,
                      currentStatus.ring,
                    )}
                  >
                    {currentStatus.label}
                  </span>
                </div>
                <h3 className="font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {order.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MedicationRecordCard({
  medication,
}: {
  medication: FullProfileData["medications"][number];
}) {
  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="relative overflow-hidden rounded-[22px] border border-[#E8E7FF]/90 bg-[linear-gradient(165deg,#fefeff_0%,#fafbff_42%,#f5fffb_100%)] shadow-[0_16px_42px_-14px_rgba(79,70,229,0.08),0_10px_28px_rgba(15,143,139,0.07)] ring-1 ring-[#e0e7ff]/70"
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#6366f1]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.07] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex-1 min-w-0 text-right">
            <div className="flex gap-3 justify-start items-start shrink-0">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#eef2ff] via-white to-[#ecfdf9] text-[#4338ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(67,56,202,0.1)] ring-1 ring-[#c7d2fe]/90">
                <Pill
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div className="">
                <div className="flex flex-wrap gap-2 justify-start items-center">
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#4338ca] ring-1 ring-[#e0e7ff] shadow-sm">
                    علاج دوائي
                  </span>
                </div>
                <h3 className="mt-2 font-cairo text-[16px] font-black leading-snug text-[#0f172a] sm:text-[17px]">
                  {medication.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
              <div className="rounded-[14px] border border-primary/15 bg-white/85 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
                <div className="flex gap-2 justify-start items-center text-primary">
                  <Activity
                    className="h-3.5 w-3.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                  <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide opacity-90">
                    الجرعة
                  </span>
                </div>
                <p className="mt-2 font-cairo text-[13px] font-bold leading-relaxed text-[#1e293b]">
                  {medication.dosage || "—"}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#fed7aa]/60 bg-[linear-gradient(145deg,#fffbeb_0%,#ffffff_100%)] px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex items-center justify-start gap-2 text-[#c2410c]">
                  <Clock
                    className="h-3.5 w-3.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                  <span className="font-cairo text-[11px] font-extrabold uppercase tracking-wide opacity-90">
                    التكرار والجدولة
                  </span>
                </div>
                <p className="mt-2 font-cairo text-[13px] font-bold leading-relaxed text-[#78350f]">
                  {medication.frequency || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PrescriptionCard({
  prescription,
  index,
}: {
  prescription: FullProfileData["prescriptions"][number];
  index: number;
}) {
  const statusStyles = {
    draft: {
      bg: "bg-[#F3F4F6]/80",
      text: "text-[#374151]",
      ring: "ring-[#D1D5DB]/60",
      label: "مسودة",
    },
    finalized: {
      bg: "bg-[#D1FAE5]/80",
      text: "text-[#065F46]",
      ring: "ring-[#86EFAC]/60",
      label: "معتمدة",
    },
    cancelled: {
      bg: "bg-[#FEE2E2]/80",
      text: "text-[#991B1B]",
      ring: "ring-[#FCA5A5]/60",
      label: "ملغاة",
    },
  };

  const currentStatus = statusStyles[
    prescription.status as keyof typeof statusStyles
  ] ?? {
    bg: "bg-[#F3F4F6]/80",
    text: "text-[#374151]",
    ring: "ring-[#D1D5DB]/60",
    label: prescription.status || "غير محدد",
  };

  return (
    <motion.article
      variants={TAB_STAGGER_ITEM}
      className="group relative overflow-hidden rounded-[22px] border border-[#E8E7FF]/95 bg-[linear-gradient(165deg,#fefeff_0%,#faf5ff_42%,#f0fdf4_100%)] shadow-[0_16px_42px_-14px_rgba(139,92,246,0.1),0_10px_28px_rgba(15,143,139,0.07)] ring-1 ring-[#e9d5ff]/50"
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05] blur-2xl"
        aria-hidden
      />

      <div className="relative px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 justify-between items-start">
            <div className="flex gap-3">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#f3e8ff] via-white to-[#ecfdf9] text-[#7C3AED] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_26px_rgba(139,92,246,0.12)] ring-1 ring-[#DDD6FE]/90">
                <FileText
                  className="h-[22px] w-[22px]"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-cairo text-[11px] font-black tabular-nums text-[#94a3b8]">
                    #{index}
                  </span>
                  <span className="inline-flex rounded-full bg-[#F5F3FF] px-2.5 py-0.5 font-cairo text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9] ring-1 ring-[#DDD6FE]/50">
                    وصفة طبية
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-bold ring-1",
                      currentStatus.bg,
                      currentStatus.text,
                      currentStatus.ring,
                    )}
                  >
                    {currentStatus.label}
                  </span>
                </div>
                <h3 className="mt-2 font-cairo text-[16px] font-black leading-snug text-[#0f172a]">
                  وصفة طبية
                </h3>
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 font-cairo text-[10px] font-bold text-[#667085]">
                <Clock className="w-3 h-3" />
                التاريخ
              </div>
              <div className="mt-1 font-cairo text-[12px] font-extrabold tabular-nums text-[#101828]">
                {prescription.createdAt}
              </div>
            </div>
          </div>

          {prescription.items.length > 0 && (
            <div className="space-y-2">
              <div className="font-cairo text-[12px] font-black text-[#475467]">
                الأدوية المدرجة ({prescription.items.length})
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {prescription.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E9D5FF]/70 bg-white/90 px-3 py-2.5 shadow-sm"
                  >
                    <div className="flex gap-2 items-start">
                      <Pill className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-cairo text-[13px] font-bold text-[#0f172a]">
                          {item.medicationName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                          <span className="font-cairo font-semibold text-[#64748b]">
                            {item.dosage}
                          </span>
                          <span className="text-[#CBD5E1]">•</span>
                          <span className="font-cairo font-semibold text-[#64748b]">
                            {item.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.notes && (
            <div className="rounded-xl border border-[#FED7AA]/60 bg-[#FFFBEB]/50 px-4 py-3">
              <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#B45309]">
                <AlertTriangle className="h-3.5 w-3.5" />
                ملاحظات الطبيب
              </div>
              <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed text-[#78350f]">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function formatIsoDate(value?: string | null): string {
  if (!value) return "لا توجد زيارات";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

function toCardData(patient: {
  _id: string;
  publicId?: string;
  user: {
    fullName: string;
    phone?: string;
    accountStatus?: "active" | "temporary" | "suspended";
  };
  allergies: string[];
  medicalConditions: string[];
  bloodType: string | null;
  lastVisitAt: string | null;
  isTemporary?: boolean;
}): Omit<DoctorPatientExpandableCardData, "relationshipState"> {
  const accountStatusLabel =
    patient.user.accountStatus === "temporary"
      ? "مؤقت"
      : patient.user.accountStatus === "suspended"
        ? "معلّق"
        : "نشط";

  return {
    id: patient._id,
    fileNo: patient.publicId ?? patient._id,
    name: patient.user.fullName,
    accountStatusLabel,
    accountStatusKey: patient.user.accountStatus ?? "active",
    isTemporary:
      patient.isTemporary ?? patient.user.accountStatus === "temporary",
    phone: patient.user.phone ?? "—",
    lastVisit: formatIsoDate(patient.lastVisitAt),
    allergies: patient.allergies ?? [],
    medicalConditions: patient.medicalConditions ?? [],
    bloodType: patient.bloodType ?? "غير محدد",
    heightLabel: "—",
    weightLabel: "—",
    measurementUnitLabel: "—",
  };
}

function getPatientAccessErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }
  if (error.messageKey === "errors.doctor.notApproved") {
    return "حساب الطبيب الحالي غير معتمد بعد، لذلك لا يمكن تحميل بيانات هذا المريض.";
  }
  if (error.status === 401) {
    return "انتهت صلاحية جلسة الدخول أو لم يتم التحقق من الهوية. سجّل الدخول من جديد.";
  }
  if (error.status === 403) {
    return error.message || "لا تملك صلاحية عرض هذا المريض بهذا الحساب.";
  }
  return error.message || getUserFacingRequestErrorMessage(error);
}

function patientNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return `${a}${b}`.toUpperCase();
  }
  const t = name.trim();
  return (t.slice(0, 2) || "؟").toUpperCase();
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0]/90 bg-gradient-to-br from-white via-[#FAFDFC] to-[#F0F9F8] px-4 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_32px_rgba(15,23,42,0.05)] transition-[box-shadow,transform] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_40px_rgba(15,143,139,0.1)]">
      <div
        className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-primary/[0.06] blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex relative gap-3 items-start">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/12 to-primary/6 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-primary/10">
            <Icon className="w-5 h-5" aria-hidden />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="font-cairo text-[11px] font-bold uppercase tracking-[0.04em] text-[#94a3b8]">
            {label}
          </div>
          <div className="mt-2 break-words font-cairo text-[15px] font-black leading-snug text-[#0f172a] sm:text-[16px] sm:leading-6">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-4 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
      {message}
    </p>
  );
}

export default function DoctorPatientDetailsPage() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId ?? "";
  const initialPatient = (
    location.state as { patient?: DoctorPatientExpandableCardData } | null
  )?.patient;

  const [activeTab, setActiveTab] = useState<PatientDetailsTab>("basic");
  const [pendingAccess, setPendingAccess] = useState<{
    pendingRequestId?: string | null;
    message?: string;
  } | null>(null);
  const [fileActionKey, setFileActionKey] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<
    "all" | "lab" | "radiology" | "procedure" | "referral"
  >("all");
  const [timelineFilter, setTimelineFilter] = useState<
    "all" | "encounter" | "file" | "order" | "prescription" | "history"
  >("all");

  const publicProfileQuery = useDoctorPatientPublicProfile(
    patientId ?? "",
    Boolean(patientId),
  );
  const fullProfileQuery = useDoctorPatientFullProfile(
    doctorId,
    patientId ?? "",
    Boolean(patientId && doctorId),
  );
  const fallbackPatient = useMemo(() => {
    if (!patientId || !publicProfileQuery.patient) return null;
    return toCardData({
      _id: publicProfileQuery.patient._id ?? patientId,
      publicId: patientId,
      user: {
        fullName: publicProfileQuery.patient.user?.fullName ?? "مريض",
        phone: publicProfileQuery.patient.user?.phone,
        accountStatus: "active",
      },
      allergies: publicProfileQuery.patient.allergies ?? [],
      medicalConditions: publicProfileQuery.patient.medicalConditions ?? [],
      bloodType: publicProfileQuery.patient.bloodType ?? null,
      lastVisitAt: null,
      isTemporary: false,
    });
  }, [patientId, publicProfileQuery.patient]);

  const fullProfileBasePatient = useMemo(() => {
    if (!patientId || !fullProfileQuery.patient) return null;
    return toCardData({
      _id: fullProfileQuery.patient._id ?? patientId,
      publicId: fullProfileQuery.patient.patientId ?? patientId,
      user: {
        fullName: fullProfileQuery.patient.user?.fullName ?? "مريض",
        phone: fullProfileQuery.patient.user?.phone,
        accountStatus: "active",
      },
      allergies: fullProfileQuery.patient.allergies ?? [],
      medicalConditions: fullProfileQuery.patient.medicalConditions ?? [],
      bloodType: fullProfileQuery.patient.bloodType ?? null,
      lastVisitAt: null,
      isTemporary: false,
    });
  }, [patientId, fullProfileQuery.patient]);

  const basePatient =
    initialPatient ?? fullProfileBasePatient ?? fallbackPatient;
  const isTemporary = Boolean(basePatient?.isTemporary);
  const encountersQuery = useDoctorPatientEncounters(
    doctorId,
    patientId ?? "",
    {
      page: 1,
      limit: 20,
      sortBy: "startedAt",
      sortOrder: "desc",
    },
    Boolean(patientId && doctorId && !isTemporary),
  );
  const patientFilesQuery = useDoctorPatientFiles(
    patientId ?? "",
    Boolean(patientId && !isTemporary && fullProfileQuery.data?.ok === true),
  );

  // جلب مواعيد المريض
  const patientAppointmentsQuery = useQuery({
    queryKey: ['doctor-patient-appointments', doctorId, patientId],
    queryFn: async () => {
      if (!doctorId || !patientId) return { appointments: [] };
      try {
        // جلب جميع المواعيد وفلترتها للمريض المحدد
        const response = await doctorApi.appointments.list({});
        const patientAppointments = response.appointments?.filter(
          (apt: any) => apt.patient?._id === patientId || apt.patient === patientId
        ) ?? [];
        console.log('🗓️ Patient Appointments:', patientAppointments);
        return { appointments: patientAppointments };
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return { appointments: [] };
      }
    },
    enabled: Boolean(patientId && doctorId && !isTemporary),
    staleTime: 1000 * 30,
  });

  const requestAccessMutation = useRequestDoctorPatientAccess(doctorId);
  const uploadPatientFileMutation = useUploadDoctorPatientFile(patientId ?? "");
  const deletePatientFileMutation = useDeleteDoctorPatientFile(patientId ?? "");

  const accessError =
    fullProfileQuery.deniedError instanceof ApiError
      ? fullProfileQuery.deniedError
      : null;
  const accessRequired =
    accessError?.messageKey === "errors.accessRequest.approvalRequired" ||
    accessError?.body?.accessRequired === true;
  const pendingRequestIdFromQuery =
    typeof accessError?.body?.pendingRequestId === "string"
      ? accessError.body.pendingRequestId
      : null;
  const accessPending = Boolean(
    pendingRequestIdFromQuery || pendingAccess?.pendingRequestId,
  );
  const accessMessage =
    pendingAccess?.message ??
    (typeof accessError?.message === "string"
      ? accessError.message
      : undefined);

  const patient = useMemo(() => {
    if (!basePatient) return null;
    const relationshipState = determinePatientState({
      isTemporary: basePatient.isTemporary ?? false,
      accessRequired,
      accessPending,
      hasActiveEncounter: false,
      accountStatus: basePatient.accountStatusKey,
      relationshipKnown: true,
    });
    return {
      ...basePatient,
      relationshipState,
      allergies: publicProfileQuery.patient?.allergies ?? basePatient.allergies,
      medicalConditions:
        publicProfileQuery.patient?.medicalConditions ??
        basePatient.medicalConditions,
      bloodType: publicProfileQuery.patient?.bloodType ?? basePatient.bloodType,
      heightLabel: publicProfileQuery.patient?.heightCm
        ? `${publicProfileQuery.patient.heightCm} سم`
        : "—",
      weightLabel: publicProfileQuery.patient?.weightKg
        ? `${publicProfileQuery.patient.weightKg} كغ`
        : "—",
      measurementUnitLabel:
        publicProfileQuery.patient?.measurementUnit === "metric"
          ? "متري"
          : (publicProfileQuery.patient?.measurementUnit ?? "—"),
    };
  }, [accessPending, accessRequired, basePatient, publicProfileQuery.patient]);

  const fullProfileData: FullProfileData | null = isTemporary
    ? {
        medicalHistory: [],
        medications: [],
        prescriptions: [],
        files: [],
        orders: [],
      }
    : fullProfileQuery.patient
      ? {
          medicalHistory: (fullProfileQuery.patient.medicalHistory ?? []).map(
            (record) => ({
              id: record._id,
              title: record.title ?? "سجل طبي",
              diagnosis: record.diagnosis ?? "—",
              date: formatIsoDate(record.date ?? record.createdAt),
            }),
          ),
          medications: (fullProfileQuery.patient.medications ?? []).map(
            (medication, index) => ({
              id: medication._id ?? `med-${index}`,
              name: medication.name ?? "دواء",
              dosage: medication.dosage ?? "—",
              frequency: medication.frequency ?? "—",
            }),
          ),
          prescriptions: (
            (fullProfileQuery.patient as any)?.prescriptions ?? []
          ).map((prescription: any, index: number) => ({
            id: prescription._id ?? `prescription-${index}`,
            status: prescription.status ?? "draft",
            createdAt: formatIsoDate(prescription.createdAt),
            items: (prescription.items ?? []).map((item: any) => ({
              medicationName:
                item.medication?.name ?? item.medicationName ?? "دواء",
              dosage: item.dosage ?? "—",
              frequency: item.frequency ?? "—",
            })),
            notes: prescription.notes ?? "",
          })),
          files: (patientFilesQuery.files.length
            ? patientFilesQuery.files
            : (fullProfileQuery.patient.files ?? [])
          ).map((file) => ({
            id: file._id,
            name: file.originalName ?? "ملف",
            createdAt: formatIsoDate(file.createdAt),
          })),
          orders: (() => {
            // Debug: تحقق من البيانات
            console.log('🔍 Full Profile Patient Data:', fullProfileQuery.patient);
            console.log('🔍 Orders from API:', fullProfileQuery.patient.orders);
            console.log('🔍 Medical Orders:', (fullProfileQuery.patient as any)?.medicalOrders);

            // جرب أكثر من مصدر محتمل للطلبات
            const ordersSource = fullProfileQuery.patient.orders ??
                                (fullProfileQuery.patient as any)?.medicalOrders ??
                                [];

            console.log('🔍 Orders Source:', ordersSource);

            return ordersSource.map((order: any, index: number) => ({
              id: order._id ?? order.id ?? `order-${index}`,
              title: order.orderTitle ?? order.title ?? order.orderName ?? order.orderType ?? order.type ?? "طلب طبي",
              status: order.status ?? order.statusCode ?? "pending",
            }));
          })(),
        }
      : null;

  useEffect(() => {
    if (fullProfileQuery.patient) {
      setPendingAccess(null);
    }
  }, [fullProfileQuery.patient]);

  const stateInfo = patient
    ? getPatientStateInfo(patient.relationshipState)
    : null;
  const stateMessage = patient
    ? getStateMessage(
        patient.relationshipState,
        pendingRequestIdFromQuery ?? pendingAccess?.pendingRequestId ?? null,
      )
    : null;

  async function handleRequestAccess() {
    if (!doctorId || !patientId) return;
    try {
      const response = await requestAccessMutation.mutateAsync({
        patientId,
        body: {
          reason: "طلب وصول من صفحة تفاصيل المريض",
        },
      });
      setPendingAccess({
        pendingRequestId:
          response.pendingRequestId ?? response.request?._id ?? null,
        message: response.message,
      });
      toast(response.message ?? "تم إرسال طلب الوصول بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر إرسال طلب الوصول",
        variant: "error",
      });
    }
  }

  async function handleOpenFile(fileId: string) {
    if (!doctorId || !patientId) return;
    setFileActionKey(fileId);
    try {
      const response = await doctorApi.patients.getFileDownloadUrl(
        doctorId,
        patientId,
        fileId,
      );
      if (response.url) {
        window.open(response.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر فتح الملف",
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleDownloadFile(fileId: string) {
    if (!doctorId || !patientId) return;
    setFileActionKey(fileId);
    try {
      const [downloadResponse, fileResponse] = await Promise.all([
        doctorApi.patients.getFileDownloadUrl(doctorId, patientId, fileId),
        doctorApi.patients.getFile(patientId, fileId),
      ]);
      if (downloadResponse.url) {
        triggerBrowserFileDownload(
          downloadResponse.url,
          fileResponse.file?.originalName ?? "patient-file",
        );
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر تحميل الملف",
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleDeleteFile(fileId: string) {
    if (!patientId) return;
    setFileActionKey(fileId);
    try {
      const response = await deletePatientFileMutation.mutateAsync(fileId);
      toast(response.message ?? "تم حذف الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر حذف الملف",
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !patientId) return;
    setFileActionKey("upload");
    try {
      const response = await uploadPatientFileMutation.mutateAsync({ file });
      toast(response.message ?? "تم رفع الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر رفع الملف",
        variant: "error",
      });
    } finally {
      event.target.value = "";
      setFileActionKey(null);
    }
  }

  function renderRestrictedPanel() {
    if (!stateInfo || !stateMessage) return null;
    const Icon =
      stateInfo.icon === "link"
        ? Link2
        : stateInfo.icon === "stethoscope"
          ? Stethoscope
          : ShieldAlert;
    return (
      <div
        className={cn(
          "rounded-2xl border px-4 py-5",
          stateMessage.type === "error"
            ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
            : stateMessage.type === "warning"
              ? "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]"
              : stateMessage.type === "success"
                ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]"
                : "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]",
        )}
      >
        <div className="flex gap-3 items-start">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 text-right">
            <div className="font-cairo text-[14px] font-extrabold">
              {stateMessage.title}
            </div>
            <p className="mt-1 font-cairo text-[13px] font-semibold leading-6">
              {accessMessage ?? stateMessage.body}
            </p>
            {stateInfo.canRequestAccess ? (
              <button
                type="button"
                onClick={handleRequestAccess}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-current bg-white px-4 font-cairo text-[13px] font-extrabold transition-opacity hover:opacity-90"
              >
                <Link2 className="w-4 h-4" />
                إرسال طلب وصول
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function renderTabContent() {
    if (activeTab === "basic") {
      const encountersCount = encountersQuery.encounters?.length ?? 0;
      const filesCount = fullProfileData?.files?.length ?? 0;
      const ordersCount = fullProfileData?.orders?.length ?? 0;
      const medicationsCount = fullProfileData?.medications?.length ?? 0;
      const prescriptionsCount = fullProfileData?.prescriptions?.length ?? 0;
      const historyCount = fullProfileData?.medicalHistory?.length ?? 0;

      const hasOpenEncounter = encountersQuery.encounters?.some(
        (e) => e.status === "open",
      );

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* مؤشرات سريعة */}
          <motion.div variants={TAB_STAGGER_ITEM}>
            <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
              المؤشرات السريعة
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <button
                type="button"
                onClick={() => setActiveTab("encounters")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#f0f9ff] to-white p-4 text-right transition-all hover:shadow-lg hover:border-[#0EA5E9]"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <Stethoscope className="h-5 w-5 text-[#0EA5E9]" />
                    {hasOpenEncounter && (
                      <span className="flex w-2 h-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                      </span>
                    )}
                  </div>
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {encountersCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    الزيارات
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#faf5ff] to-white p-4 text-right transition-all hover:shadow-lg hover:border-[#A855F7]"
              >
                <div className="relative z-10">
                  <ClipboardList className="h-5 w-5 mb-2 text-[#A855F7]" />
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {historyCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    سجلات طبية
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("medications")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#fef3f2] to-white p-4 text-right transition-all hover:shadow-lg hover:border-[#F43F5E]"
              >
                <div className="relative z-10">
                  <Pill className="h-5 w-5 mb-2 text-[#F43F5E]" />
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {medicationsCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    أدوية
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prescriptions")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#faf5ff] to-white p-4 text-right transition-all hover:shadow-lg hover:border-[#8B5CF6]"
              >
                <div className="relative z-10">
                  <FileText className="h-5 w-5 mb-2 text-[#8B5CF6]" />
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {prescriptionsCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    وصفات
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tests")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#fefce8] to-white p-4 text-right transition-all hover:shadow-lg hover:border-[#EAB308]"
              >
                <div className="relative z-10">
                  <Activity className="h-5 w-5 mb-2 text-[#EAB308]" />
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {ordersCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    طلبات
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("files")}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#f0fdfa] to-white p-4 text-right transition-all hover:shadow-lg hover:border-primary"
              >
                <div className="relative z-10">
                  <FileText className="mb-2 w-5 h-5 text-primary" />
                  <div className="font-cairo text-[24px] font-black text-[#0F172A]">
                    {filesCount}
                  </div>
                  <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                    ملفات
                  </div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* حالة الوصول - يظهر فقط إذا كان هناك قيود */}
          {stateInfo && !stateInfo.canViewFullProfile && stateMessage && (
            <motion.div variants={TAB_STAGGER_ITEM}>
              <div
                className={cn(
                  "rounded-2xl border px-5 py-4",
                  stateInfo.color.border ?? "border-[#E2E8F0]",
                  "bg-gradient-to-br from-white to-[" +
                    stateInfo.color.bg.replace("bg-", "") +
                    "]/20",
                )}
                style={{
                  backgroundImage: `linear-gradient(to bottom right, white, ${
                    stateInfo.color.bg.includes("[#")
                      ? stateInfo.color.bg
                          .match(/\[#[^\]]+\]/)?.[0]
                          .replace("[", "")
                          .replace("]", "") + "20"
                      : "#F8FAFC20"
                  })`,
                }}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      stateInfo.color.bg.replace("bg-", "bg-") + "/20",
                      stateInfo.color.text,
                    )}
                  >
                    {stateInfo.icon === "alert" ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : stateInfo.icon === "link" ? (
                      <Link2 className="w-5 h-5" />
                    ) : stateInfo.icon === "clock" ||
                      stateInfo.icon === "hourglass" ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Stethoscope className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-cairo text-[14px] font-extrabold text-[#101828]">
                      حالة الوصول إلى الملف
                    </h4>
                    <p className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#475467]">
                      {stateMessage.body}
                    </p>
                    {stateInfo.canRequestAccess && (
                      <button
                        type="button"
                        onClick={handleRequestAccess}
                        disabled={requestAccessMutation.isPending}
                        className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-cairo text-[12px] font-extrabold text-white transition-colors hover:bg-[#0d7a77] disabled:opacity-60"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        إرسال طلب وصول
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* آخر نشاط */}
          {!accessRequired && (
            <motion.div variants={TAB_STAGGER_ITEM}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-cairo text-[15px] font-black text-[#101828]">
                  آخر نشاط
                </h3>
                {(encountersCount > 0 || filesCount > 0) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className="font-cairo text-[12px] font-bold text-primary hover:underline"
                  >
                    عرض الخط الزمني
                  </button>
                )}
              </div>
              {encountersCount === 0 && filesCount === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
                  <Clock className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                  <p className="mt-3 font-cairo text-[14px] font-bold text-[#64748B]">
                    لا يوجد نشاط مسجّل بعد
                  </p>
                  <p className="mt-1 font-cairo text-[12px] font-semibold text-[#94A3B8]">
                    ستظهر هنا الزيارات والملفات الأخيرة
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {encountersCount > 0 && encountersQuery.encounters?.[0] ? (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4">
                      <div className="flex gap-3 items-start">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE]/60 text-[#0EA5E9]">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                            آخر زيارة
                          </div>
                          <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#0F172A]">
                            {encountersQuery.encounters[0].status === "open"
                              ? "زيارة مفتوحة حالياً"
                              : formatIsoDate(
                                  encountersQuery.encounters[0].startedAt ??
                                    encountersQuery.encounters[0].createdAt ??
                                    "",
                                )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-[#DBEAFE]/50 bg-[#EFF6FF]/50 px-4 py-6 text-center">
                      <Stethoscope className="mx-auto h-8 w-8 text-[#93C5FD]" />
                      <p className="mt-2 font-cairo text-[12px] font-bold text-[#64748B]">
                        لا توجد زيارات
                      </p>
                    </div>
                  )}
                  {filesCount > 0 && fullProfileData?.files?.[0] ? (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4">
                      <div className="flex gap-3 items-start">
                        <div className="flex justify-center items-center w-10 h-10 rounded-xl shrink-0 bg-primary/10 text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                            آخر ملف
                          </div>
                          <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#0F172A] truncate">
                            {fullProfileData.files[0].name}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-medium text-[#94A3B8]">
                            {fullProfileData.files[0].createdAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
                      <FileText className="mx-auto w-8 h-8 text-primary/40" />
                      <p className="mt-2 font-cairo text-[12px] font-bold text-[#64748B]">
                        لا توجد ملفات
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* إحصائيات الطلبات الطبية */}
          {!accessRequired && (
            <motion.div variants={TAB_STAGGER_ITEM}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-cairo text-[15px] font-black text-[#101828]">
                  الطلبات الطبية
                </h3>
                {ordersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("tests")}
                    className="font-cairo text-[12px] font-bold text-primary hover:underline"
                  >
                    عرض الكل
                  </button>
                )}
              </div>
              {ordersCount === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
                  <Activity className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                  <p className="mt-3 font-cairo text-[14px] font-bold text-[#64748B]">
                    لا توجد طلبات طبية مسجّلة بعد
                  </p>
                  <p className="mt-1 font-cairo text-[12px] font-semibold text-[#94A3B8]">
                    ستظهر هنا الطلبات الطبية عند إضافتها
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-[#FEF3C7]/70 bg-gradient-to-br from-[#FEFCE8] to-white p-3">
                    <div className="flex gap-2 items-center mb-2">
                      <FlaskConical className="h-4 w-4 text-[#CA8A04]" />
                      <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                        التحاليل
                      </span>
                    </div>
                    <div className="font-cairo text-[20px] font-black text-[#0F172A]">
                      {fullProfileData?.orders.filter(
                        (o) =>
                          o.title.toLowerCase().includes("تحليل") ||
                          o.title.toLowerCase().includes("فحص") ||
                          o.title.toLowerCase().includes("lab"),
                      ).length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E0E7FF]/70 bg-gradient-to-br from-[#EFF6FF] to-white p-3">
                    <div className="flex gap-2 items-center mb-2">
                      <ScanLine className="h-4 w-4 text-[#3B82F6]" />
                      <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                        الأشعة
                      </span>
                    </div>
                    <div className="font-cairo text-[20px] font-black text-[#0F172A]">
                      {fullProfileData?.orders.filter(
                        (o) =>
                          o.title.toLowerCase().includes("أشعة") ||
                          o.title.toLowerCase().includes("تصوير") ||
                          o.title.toLowerCase().includes("radiology"),
                      ).length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#FEE2E2]/70 bg-gradient-to-br from-[#FEF2F2] to-white p-3">
                    <div className="flex gap-2 items-center mb-2">
                      <Syringe className="h-4 w-4 text-[#EF4444]" />
                      <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                        الإجراءات
                      </span>
                    </div>
                    <div className="font-cairo text-[20px] font-black text-[#0F172A]">
                      {fullProfileData?.orders.filter(
                        (o) =>
                          o.title.toLowerCase().includes("إجراء") ||
                          o.title.toLowerCase().includes("عملية") ||
                          o.title.toLowerCase().includes("procedure"),
                      ).length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#D1FAE5]/70 bg-gradient-to-br from-[#ECFDF5] to-white p-3">
                    <div className="flex gap-2 items-center mb-2">
                      <Users className="h-4 w-4 text-[#10B981]" />
                      <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                        التحويلات
                      </span>
                    </div>
                    <div className="font-cairo text-[20px] font-black text-[#0F172A]">
                      {fullProfileData?.orders.filter(
                        (o) =>
                          o.title.toLowerCase().includes("تحويل") ||
                          o.title.toLowerCase().includes("referral") ||
                          o.title.toLowerCase().includes("إحالة"),
                      ).length ?? 0}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* الأدوية والوصفات النشطة */}
          {!accessRequired && (
            <motion.div variants={TAB_STAGGER_ITEM}>
              <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
                الأدوية والوصفات
              </h3>
              {medicationsCount === 0 && prescriptionsCount === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
                  <Pill className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                  <p className="mt-3 font-cairo text-[14px] font-bold text-[#64748B]">
                    لا توجد أدوية أو وصفات مسجّلة بعد
                  </p>
                  <p className="mt-1 font-cairo text-[12px] font-semibold text-[#94A3B8]">
                    ستظهر هنا الأدوية والوصفات الطبية عند إضافتها
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {/* الأدوية النشطة */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Pill className="h-4 w-4 text-[#F43F5E]" />
                        <span className="font-cairo text-[13px] font-bold text-[#475467]">
                          الأدوية النشطة ({medicationsCount})
                        </span>
                      </div>
                      {medicationsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("medications")}
                          className="font-cairo text-[11px] font-bold text-primary hover:underline"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                    {medicationsCount === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-[#FEE2E2]/60 bg-[#FEF2F2]/50 px-4 py-6 text-center">
                        <Pill className="mx-auto h-8 w-8 text-[#FCA5A5]" />
                        <p className="mt-2 font-cairo text-[12px] font-bold text-[#64748B]">
                          لا توجد أدوية مسجّلة
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fullProfileData?.medications
                          .slice(0, 2)
                          .map((medication) => (
                        <div
                          key={medication.id}
                          className="rounded-xl border border-[#FEE2E2]/60 bg-gradient-to-br from-[#FEF2F2] to-white p-3"
                        >
                          <div className="flex gap-2 items-start">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#F43F5E] ring-1 ring-[#FEE2E2]">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-cairo text-[13px] font-bold text-[#0F172A] truncate">
                                {medication.name}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                                <span className="font-cairo font-medium text-[#64748B]">
                                  {medication.dosage}
                                </span>
                                <span className="text-[#CBD5E1]">•</span>
                                <span className="font-cairo font-medium text-[#64748B]">
                                  {medication.frequency}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* آخر الوصفات */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <FileText className="h-4 w-4 text-[#8B5CF6]" />
                        <span className="font-cairo text-[13px] font-bold text-[#475467]">
                          آخر الوصفات ({prescriptionsCount})
                        </span>
                      </div>
                      {prescriptionsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("prescriptions")}
                          className="font-cairo text-[11px] font-bold text-primary hover:underline"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                    {prescriptionsCount === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-[#E9D5FF]/60 bg-[#FAF5FF]/50 px-4 py-6 text-center">
                        <FileText className="mx-auto h-8 w-8 text-[#DDD6FE]" />
                        <p className="mt-2 font-cairo text-[12px] font-bold text-[#64748B]">
                          لا توجد وصفات مسجّلة
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fullProfileData?.prescriptions
                          .slice(0, 2)
                          .map((prescription) => (
                        <div
                          key={prescription.id}
                          className="rounded-xl border border-[#E9D5FF]/60 bg-gradient-to-br from-[#FAF5FF] to-white p-3"
                        >
                          <div className="flex gap-2 items-start">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#8B5CF6] ring-1 ring-[#E9D5FF]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-cairo text-[13px] font-bold text-[#0F172A]">
                                وصفة طبية
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="font-cairo text-[11px] font-medium text-[#64748B]">
                                  {prescription.items.length} دواء
                                </span>
                                <span className="text-[#CBD5E1]">•</span>
                                <span className="font-cairo text-[11px] font-medium text-[#64748B]">
                                  {prescription.createdAt}
                                </span>
                              </div>
                            </div>
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* المعلومات الأساسية */}
          <motion.div variants={TAB_STAGGER_ITEM}>
            <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                label="فصيلة الدم"
                value={patient?.bloodType ?? "—"}
                icon={Heart}
              />
              <InfoCard label="الطول" value={patient?.heightLabel ?? "—"} />
              <InfoCard label="الوزن" value={patient?.weightLabel ?? "—"} />
              <InfoCard
                label="وحدة القياس"
                value={patient?.measurementUnitLabel ?? "—"}
              />
            </div>
          </motion.div>

          {/* الحساسية والأمراض المزمنة */}
          <motion.div variants={TAB_STAGGER_ITEM}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-cairo text-[15px] font-black text-[#101828]">
                الحساسية والأمراض المزمنة
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl bg-[#FEF2F2] px-4 py-4">
                <div className="flex gap-2 items-start mb-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[#B42318]" />
                  <span className="font-cairo text-[14px] font-extrabold text-[#B42318]">
                    الحساسية
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.allergies.length ? (
                    patient.allergies.map((value) => (
                      <span
                        key={value}
                        className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#B42318] ring-1 ring-[#FECACA]"
                      >
                        {value}
                      </span>
                    ))
                  ) : (
                    <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                      لا توجد حساسية مسجلة
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-[#FFF4ED] px-4 py-4">
                <div className="flex gap-2 items-start mb-3">
                  <Heart className="h-5 w-5 shrink-0 text-[#EA580C]" />
                  <span className="font-cairo text-[14px] font-extrabold text-[#C4320A]">
                    الأمراض المزمنة
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.medicalConditions.length ? (
                    patient.medicalConditions.map((value) => (
                      <span
                        key={value}
                        className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#C4320A] ring-1 ring-[#FDBA74]"
                      >
                        {value}
                      </span>
                    ))
                  ) : (
                    <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                      لا توجد حالات مزمنة مسجلة
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (accessRequired) {
      return renderRestrictedPanel();
    }

    const awaitingFullProfile =
      !isTemporary &&
      (fullProfileQuery.isLoading ||
        (!fullProfileQuery.patient && fullProfileQuery.isFetching));

    if (awaitingFullProfile) {
      return <PatientDetailsTabSkeleton rows={activeTab === "files" ? 3 : 4} />;
    }

    if (!fullProfileData) {
      return (
        <EmptyPanel message="لا توجد بيانات إضافية متاحة لهذا المريض حاليًا." />
      );
    }

    if (activeTab === "timeline") {
      // جمع كل النشاطات وترتيبها زمنياً
      const timelineItems: Array<{
        id: string;
        type: "encounter" | "file" | "order" | "prescription" | "history";
        date: string;
        title: string;
        description: string;
        icon: LucideIcon;
        color: string;
      }> = [];

      // إضافة الزيارات
      encountersQuery.encounters?.forEach((encounter) => {
        timelineItems.push({
          id: encounter._id,
          type: "encounter",
          date: encounter.startedAt ?? encounter.createdAt ?? "",
          title: "زيارة طبية",
          description: encounter.notes || "زيارة سريرية",
          icon: Stethoscope,
          color: "bg-[#0EA5E9] text-white",
        });
      });

      // إضافة الملفات
      fullProfileData?.files.forEach((file) => {
        timelineItems.push({
          id: file.id,
          type: "file",
          date: file.createdAt,
          title: "ملف جديد",
          description: file.name,
          icon: FileText,
          color: "bg-primary text-white",
        });
      });

      // إضافة الطلبات
      fullProfileData?.orders.forEach((order) => {
        timelineItems.push({
          id: order.id,
          type: "order",
          date: new Date().toISOString(), // استخدم التاريخ الفعلي إذا كان متوفراً
          title: "طلب طبي",
          description: order.title,
          icon: Activity,
          color: "bg-[#EAB308] text-white",
        });
      });

      // إضافة الوصفات
      fullProfileData?.prescriptions.forEach((prescription) => {
        timelineItems.push({
          id: prescription.id,
          type: "prescription",
          date: prescription.createdAt,
          title: "وصفة طبية",
          description: `${prescription.items.length} دواء`,
          icon: FileText,
          color: "bg-[#8B5CF6] text-white",
        });
      });

      // إضافة السجل الطبي
      fullProfileData?.medicalHistory.forEach((record) => {
        timelineItems.push({
          id: record.id,
          type: "history",
          date: record.date,
          title: record.title,
          description: record.diagnosis,
          icon: ClipboardList,
          color: "bg-[#A855F7] text-white",
        });
      });

      // ترتيب حسب التاريخ (الأحدث أولاً)
      timelineItems.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      // تصفية حسب النوع
      const filteredTimelineItems =
        timelineFilter === "all"
          ? timelineItems
          : timelineItems.filter((item) => item.type === timelineFilter);

      const timelineFilterOptions: Array<{
        id: "all" | "encounter" | "file" | "order" | "prescription" | "history";
        label: string;
        icon: LucideIcon;
      }> = [
        { id: "all", label: "الكل", icon: Clock },
        { id: "encounter", label: "الزيارات", icon: Stethoscope },
        { id: "history", label: "السجلات", icon: ClipboardList },
        { id: "prescription", label: "الوصفات", icon: FileText },
        { id: "order", label: "الطلبات", icon: Activity },
        { id: "file", label: "الملفات", icon: FileText },
      ];

      if (timelineItems.length === 0) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
                title="لا توجد نشاطات مسجّلة بعد"
                subtitle="سيظهر هنا تسلسل زمني لجميع نشاطات المريض عند إضافتها"
                actionLabel="إضافة سجل طبي"
                onAction={() => navigate("/doctor/medical-records/new")}
                actionIcon={<ClipboardList className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* فلاتر Timeline */}
          <motion.div
            variants={TAB_STAGGER_ITEM}
            className="flex flex-wrap gap-2 items-center"
          >
            {timelineFilterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = timelineFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setTimelineFilter(filter.id)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all duration-200",
                    isActive
                      ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.18)]"
                      : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F1F5F9] hover:ring-[#CBD5E1]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {filter.label}
                </button>
              );
            })}
            <div className="mr-auto font-cairo text-[12px] font-semibold text-[#64748B]">
              {filteredTimelineItems.length} نشاط
            </div>
          </motion.div>

          {/* قائمة Timeline */}
          {filteredTimelineItems.length === 0 ? (
            <motion.div
              variants={TAB_STAGGER_ITEM}
              className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]"
            >
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-[#94A3B8]" />
                <p className="mt-3 font-cairo text-[15px] font-bold text-[#64748B]">
                  لا توجد نشاطات تطابق الفلتر المحدد
                </p>
              </div>
            </motion.div>
          ) : (
            filteredTimelineItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === timelineItems.length - 1;

            return (
              <motion.div
                key={item.id}
                variants={TAB_STAGGER_ITEM}
                className="flex relative gap-4"
              >
                {/* خط الـ Timeline */}
                {!isLast && (
                  <div className="absolute right-[19px] top-[48px] h-[calc(100%+16px)] w-[2px] bg-gradient-to-b from-[#E2E8F0] to-transparent" />
                )}

                {/* أيقونة النشاط */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg",
                      item.color,
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* محتوى النشاط */}
                <div className="flex-1 pb-8">
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-cairo text-[14px] font-bold text-[#0F172A]">
                          {item.title}
                        </h4>
                        <p className="mt-1 font-cairo text-[13px] font-medium text-[#64748B]">
                          {item.description}
                        </p>
                      </div>
                      <time className="shrink-0 font-cairo text-[11px] font-semibold text-[#94A3B8]">
                        {item.date}
                      </time>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }))}
        </motion.div>
      );
    }

    if (activeTab === "encounters") {
      if (encountersQuery.isLoading) {
        return <PatientDetailsTabSkeleton rows={4} />;
      }

      if (encountersQuery.isError) {
        return (
          <DoctorListErrorState
            title="تعذّر تحميل الزيارات الطبية"
            brief={getUserFacingRequestErrorMessage(encountersQuery.error)}
            detail={getUserFacingRequestErrorMessage(encountersQuery.error)}
            retrying={encountersQuery.isFetching}
            onRetry={() => {
              void encountersQuery.refetch();
            }}
          />
        );
      }

      if (!encountersQuery.encounters.length) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
                title="لا توجد زيارات مسجّلة بعد"
                subtitle="توثّق الزيارات السريرية من السجل الطبي؛ ستظهر هنا عند ربطها بهذا المريض في النظام."
                actionLabel="الانتقال إلى السجلات الطبية"
                onAction={() => navigate("/doctor/medical-records")}
                actionIcon={<ClipboardList className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {encountersQuery.encounters.map((encounter, index) => {
            const startedAt = encounter.startedAt ?? encounter.createdAt ?? "";
            const startedLabel = startedAt
              ? formatIsoDate(startedAt)
              : "غير محدد";
            const closedAt = encounter.closedAt ?? "";
            const closedLabel = closedAt ? formatIsoDate(closedAt) : "—";
            const statusLabel =
              encounter.status === "closed" ? "مغلقة" : "مفتوحة";
            const statusTone =
              encounter.status === "closed"
                ? "bg-[#F3F4F6] text-[#475467] ring-[#E5E7EB]"
                : "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]";
            const originLabel =
              encounter.origin === "appointment"
                ? "من موعد"
                : encounter.origin === "walk_in"
                  ? "زيارة مباشرة"
                  : encounter.origin === "follow_up"
                    ? "متابعة"
                    : encounter.origin === "manual"
                      ? "إدخال يدوي"
                      : "غير محدد";

            const originIcon =
              encounter.origin === "appointment" ? (
                <Calendar className="w-4 h-4" />
              ) : encounter.origin === "walk_in" ? (
                <UserCheck className="w-4 h-4" />
              ) : encounter.origin === "follow_up" ? (
                <ClipboardList className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              );

            return (
              <motion.article
                key={encounter._id}
                variants={TAB_STAGGER_ITEM}
                className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-gradient-to-br from-white to-[#F8FAFC]/50 px-5 py-5 shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-[#0F8F8B]/40 hover:shadow-[0_20px_48px_-16px_rgba(15,143,139,0.18),0_8px_24px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-col gap-4 text-right lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 justify-start items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2.5 py-1 font-cairo text-[11px] font-black text-[#64748B]">
                        {originIcon}
                        {originLabel}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[11px] font-extrabold ring-1 ring-inset",
                          statusTone,
                        )}
                      >
                        {encounter.status === "closed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <span className="flex relative w-2 h-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#027A48] opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#027A48]"></span>
                          </span>
                        )}
                        {statusLabel}
                      </span>
                      <span className="font-cairo text-[11px] font-black text-[#94A3B8]">
                        #{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-3 flex items-center gap-2 font-cairo text-[16px] font-black text-[#0F172A]">
                      <Stethoscope className="h-5 w-5 text-[#0F8F8B]" />
                      زيارة سريرية
                    </h3>
                    <p className="mt-2 font-cairo text-[13px] font-semibold leading-6 text-[#475467]">
                      {encounter.notes?.trim() ||
                        "لا توجد ملاحظات مسجّلة لهذه الزيارة بعد."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[420px] lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#667085]">
                        <Clock className="h-3.5 w-3.5" />
                        تاريخ البدء
                      </div>
                      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
                        {startedLabel}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#667085]">
                        <Clock className="h-3.5 w-3.5" />
                        تاريخ الإغلاق
                      </div>
                      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
                        {closedLabel}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm sm:col-span-2">
                      <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#667085]">
                        <Calendar className="h-3.5 w-3.5" />
                        الموعد المرتبط
                      </div>
                      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
                        {encounter.appointment?._id
                          ? encounter.appointment.appointmentTypeNameSnapshot ||
                            encounter.appointment.appointmentType ||
                            "موعد مرتبط"
                          : "لا يوجد موعد"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      );
    }

    if (activeTab === "history") {
      return fullProfileData.medicalHistory.length ? (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {fullProfileData.medicalHistory.map((record, idx) => (
            <MedicalHistoryRecordCard
              key={record.id}
              record={record}
              index={idx + 1}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyPanel message="لا توجد سجلات طبية مرتبطة بهذا المريض." />
      );
    }

    if (activeTab === "medications") {
      if (!fullProfileData.medications.length) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="violet"
                imageSrc="/images/photo-not-medicines.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
                title="لا توجد أدوية مسجّلة بعد"
                subtitle="قم بإضافة أدوية المريض الآن"
                actionLabel="إضافة أدوية"
                onAction={() => navigate("/doctor/medical-records")}
                actionIcon={<Pill className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {fullProfileData.medications.map((medication) => (
            <MedicationRecordCard key={medication.id} medication={medication} />
          ))}
        </motion.div>
      );
    }

    if (activeTab === "prescriptions") {
      if (!fullProfileData.prescriptions.length) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="violet"
                imageSrc="/images/photo-not-medicines.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(139,92,246,0.12)]"
                title="لا توجد وصفات طبية مسجّلة بعد"
                subtitle="الوصفات الطبية المعتمدة من قبل الطبيب ستظهر هنا عند إنشائها وربطها بملف المريض."
                actionLabel="إنشاء وصفة جديدة"
                onAction={() => navigate("/doctor/prescriptions")}
                actionIcon={<FileText className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div
            variants={TAB_STAGGER_ITEM}
            className="flex justify-start"
          >
            <button
              type="button"
              onClick={() => navigate("/doctor/prescriptions")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(124,58,237,0.18)] transition-colors hover:bg-[#6D28D9]"
            >
              <FileText className="w-4 h-4" />
              إدارة الوصفات الطبية
            </button>
          </motion.div>

          <motion.div className="space-y-4">
            {fullProfileData.prescriptions.map((prescription, idx) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                index={idx + 1}
              />
            ))}
          </motion.div>
        </motion.div>
      );
    }

    if (activeTab === "tests") {
      if (!fullProfileData.orders.length) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
                title="لا توجد طلبات مسجّلة بعد"
                subtitle="قم بإضافة طلب وصول الآن"
                actionLabel="إضافة طلب وصول"
                onAction={() => navigate("/doctor/access-requests")}
                actionIcon={<Link2 className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      const filteredOrders =
        orderTypeFilter === "all"
          ? fullProfileData.orders
          : fullProfileData.orders.filter((order) => {
              const orderType = order.title.toLowerCase();
              if (orderTypeFilter === "lab") {
                return (
                  orderType.includes("تحليل") ||
                  orderType.includes("فحص") ||
                  orderType.includes("lab") ||
                  orderType.includes("test")
                );
              }
              if (orderTypeFilter === "radiology") {
                return (
                  orderType.includes("أشعة") ||
                  orderType.includes("تصوير") ||
                  orderType.includes("radiology") ||
                  orderType.includes("scan") ||
                  orderType.includes("x-ray")
                );
              }
              if (orderTypeFilter === "procedure") {
                return (
                  orderType.includes("إجراء") ||
                  orderType.includes("عملية") ||
                  orderType.includes("procedure")
                );
              }
              if (orderTypeFilter === "referral") {
                return (
                  orderType.includes("تحويل") ||
                  orderType.includes("referral") ||
                  orderType.includes("إحالة")
                );
              }
              return true;
            });

      const filterOptions: Array<{
        id: "all" | "lab" | "radiology" | "procedure" | "referral";
        label: string;
        icon: LucideIcon;
      }> = [
        { id: "all", label: "الكل", icon: ClipboardList },
        { id: "lab", label: "التحاليل", icon: FlaskConical },
        { id: "radiology", label: "الأشعة", icon: ScanLine },
        { id: "procedure", label: "الإجراءات", icon: Syringe },
        { id: "referral", label: "التحويلات", icon: Users },
      ];

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div
            variants={TAB_STAGGER_ITEM}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap gap-2 items-center">
              {filterOptions.map((filter) => {
                const Icon = filter.icon;
                const isActive = orderTypeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setOrderTypeFilter(filter.id)}
                    className={cn(
                      "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.18)]"
                        : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F1F5F9] hover:ring-[#CBD5E1]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => navigate("/doctor/access-requests")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.18)] transition-colors hover:bg-[#0d7a77]"
            >
              <FileText className="w-4 h-4" />
              إدارة طلبات الوصول
            </button>
          </motion.div>

          {filteredOrders.length === 0 ? (
            <motion.div
              variants={TAB_STAGGER_ITEM}
              className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]"
            >
              <div className="text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-[#94A3B8]" />
                <p className="mt-3 font-cairo text-[15px] font-bold text-[#64748B]">
                  لا توجد طلبات تطابق الفلتر المحدد
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="space-y-4">
              {filteredOrders.map((order, idx) => (
                <MedicalOrderCard
                  key={order.id}
                  order={order}
                  index={idx + 1}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      );
    }

    if (activeTab === "files") {
      if (!fullProfileData.files.length) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
                title="لا يوجد ملفات مضافة بعد"
                subtitle="قم بإضافة ملف جديد الآن"
                actionLabel="رفع ملف"
                onAction={() =>
                  document
                    .getElementById("doctor-patient-details-file-upload")
                    ?.click()
                }
                actionIcon={<Upload className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div
            variants={TAB_STAGGER_ITEM}
            className="flex justify-start"
          >
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("doctor-patient-details-file-upload")
                  ?.click()
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.18)] transition-colors hover:bg-[#0d7a77]"
            >
              <Upload className="w-4 h-4" />
              رفع ملف
            </button>
          </motion.div>
          {fullProfileData.files.map((file) => {
            const isBusy = fileActionKey === file.id;
            return (
              <motion.div
                key={file.id}
                variants={TAB_STAGGER_ITEM}
                className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3 items-center">
                  <FileText className="w-5 h-5 shrink-0 text-primary" />
                  <div className="text-right">
                    <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                      {file.name}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                      {file.createdAt}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenFile(file.id)}
                    disabled={isBusy}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    عرض
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(file.id)}
                    disabled={isBusy}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تحميل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={isBusy}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#F04438] bg-white px-3 font-cairo text-[12px] font-bold text-[#D92D20] transition-colors hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      );
    }

    if (activeTab === "documents") {
      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
            <PatientTabEmptyIllustration
              variant="violet"
              imageSrc="/images/photo-not-medicines.png"
              imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
              title="الوثائق السريرية غير مربوطة بعد"
              subtitle="الـ API يدعم وثائق encounter المرتبطة بالوصفات والطلبات وملفات المريض، لكن هذا المسار لم يُنفّذ بعد داخل الملف."
              actionLabel="عرض الملفات الحالية"
              onAction={() => setActiveTab("files")}
              actionIcon={<FileText className="w-4 h-4" />}
            />
          </motion.div>
        </motion.div>
      );
    }

    if (activeTab === "appointments") {
      if (patientAppointmentsQuery.isLoading) {
        return <PatientDetailsTabSkeleton rows={3} />;
      }

      if (patientAppointmentsQuery.isError) {
        return (
          <DoctorListErrorState
            title="تعذّر تحميل المواعيد"
            brief="حدث خطأ أثناء تحميل مواعيد المريض"
            detail="حدث خطأ أثناء تحميل مواعيد المريض"
            retrying={patientAppointmentsQuery.isFetching}
            onRetry={() => {
              void patientAppointmentsQuery.refetch();
            }}
          />
        );
      }

      const appointments = patientAppointmentsQuery.data?.appointments ?? [];

      if (appointments.length === 0) {
        return (
          <motion.div
            variants={TAB_STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
                title="لا توجد مواعيد مسجّلة"
                subtitle="لا توجد مواعيد محجوزة لهذا المريض حتى الآن"
                actionLabel="حجز موعد جديد"
                onAction={() => navigate("/doctor/appointments")}
                actionIcon={<CalendarDays className="w-4 h-4" />}
              />
            </motion.div>
          </motion.div>
        );
      }

      return (
        <motion.div
          variants={TAB_STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div variants={TAB_STAGGER_ITEM} className="flex justify-start">
            <button
              type="button"
              onClick={() => navigate("/doctor/appointments")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.18)] transition-colors hover:bg-[#0d7a77]"
            >
              <Plus className="w-4 h-4" />
              حجز موعد جديد
            </button>
          </motion.div>

          {appointments.map((appointment: any, index: number) => {
            const statusColors: Record<string, {
              bg: string;
              text: string;
              ring: string;
              label: string;
              icon: string;
              gradient: string;
            }> = {
              scheduled: {
                bg: "bg-[#EFF8FF]/80",
                text: "text-[#175CD3]",
                ring: "ring-[#B2DDFF]/60",
                label: "مجدول",
                icon: "📅",
                gradient: "from-[#EFF8FF] to-[#F0F9FF]"
              },
              completed: {
                bg: "bg-[#ECFDF3]/80",
                text: "text-[#027A48]",
                ring: "ring-[#ABEFC6]/60",
                label: "مكتمل",
                icon: "✅",
                gradient: "from-[#ECFDF5] to-[#F0FDF4]"
              },
              cancelled: {
                bg: "bg-[#FEE2E2]/80",
                text: "text-[#991B1B]",
                ring: "ring-[#FCA5A5]/60",
                label: "ملغى",
                icon: "❌",
                gradient: "from-[#FEF2F2] to-[#FEE2E2]"
              },
              no_show: {
                bg: "bg-[#F3F4F6]/80",
                text: "text-[#475467]",
                ring: "ring-[#E5E7EB]/60",
                label: "لم يحضر",
                icon: "⏰",
                gradient: "from-[#F9FAFB] to-[#F3F4F6]"
              },
            };

            const status = statusColors[appointment.status] ?? {
              bg: "bg-[#F3F4F6]/80",
              text: "text-[#475467]",
              ring: "ring-[#E5E7EB]/60",
              label: appointment.status,
              icon: "📋",
              gradient: "from-white to-[#F8FAFC]"
            };

            return (
              <motion.article
                key={appointment._id ?? index}
                variants={TAB_STAGGER_ITEM}
                className="group relative overflow-hidden rounded-[22px] border border-[#E2E8F0]/95 bg-gradient-to-br from-white to-[#F8FAFC]/50 shadow-[0_16px_42px_-14px_rgba(15,143,139,0.12),0_6px_18px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_20px_48px_-16px_rgba(15,143,139,0.18),0_8px_24px_rgba(15,23,42,0.08)] hover:border-[#0F8F8B]/40"
              >
                {/* خلفية متدرجة */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-60",
                    `bg-gradient-to-br ${status.gradient}`
                  )}
                  aria-hidden
                />

                {/* Decorative circles */}
                <div
                  className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-2xl"
                  aria-hidden
                />

                <div className="relative px-5 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* المحتوى الرئيسي */}
                    <div className="flex flex-1 gap-4 items-start">
                      {/* أيقونة الموعد */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_26px_rgba(15,143,139,0.12)] ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                        <CalendarDays className="w-6 h-6" strokeWidth={2.25} aria-hidden />
                      </div>

                      {/* التفاصيل */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 font-cairo text-[11px] font-black text-[#64748B]">
                            <span aria-hidden>{status.icon}</span>
                            #{index + 1}
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[11px] font-extrabold ring-1 ring-inset",
                            status.bg,
                            status.text,
                            status.ring,
                          )}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="mt-2 font-cairo text-[17px] font-black leading-snug text-[#0F172A]">
                          {appointment.appointmentTypeName || appointment.appointmentType || "موعد طبي"}
                        </h3>
                        {appointment.notes && (
                          <p className="mt-2 font-cairo text-[13px] font-semibold leading-relaxed text-[#64748B] line-clamp-2">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* معلومات الموعد */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[400px]">
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#667085]">
                          <Calendar className="h-3.5 w-3.5" />
                          التاريخ
                        </div>
                        <div className="mt-1 font-cairo text-[14px] font-extrabold text-[#101828]">
                          {appointment.date ? formatIsoDate(appointment.date) : "—"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#667085]">
                          <Clock className="h-3.5 w-3.5" />
                          الوقت
                        </div>
                        <div className="mt-1 font-cairo text-[14px] font-extrabold text-[#101828]">
                          {appointment.startTime || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      );
    }

    return (
      <EmptyPanel message="هذا القسم نُقل إلى صفحة مستقلة، وسيُستكمل ربطه التفصيلي في المرحلة التالية." />
    );
  }

  const patientError = publicProfileQuery.error;

  return (
    <>
      <input
        id="doctor-patient-details-file-upload"
        type="file"
        className="hidden"
        onChange={handleUploadFile}
      />
      <Helmet>
        <title>تفاصيل المريض • LMJ Health</title>
        <style>{`
          @media print {
            @page { margin: 2cm; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            button, .no-print { display: none !important; }
            .print-break { page-break-after: always; }
            * { box-shadow: none !important; }
          }
        `}</style>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-right">
            <div className="font-cairo text-[26px] font-black leading-[34px] text-[#111827]">
              ملف المريض
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#64748b]">
              {patientError && patientId ? (
                <>
                  لتصعيد المشكلة مع الدعم يُستخدَم معرّف النظام:{" "}
                  <span className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#334155]">
                    {patientId}
                  </span>
                </>
              ) : patient ? (
                "عرض البيانات المعتمدة والسجل الصحي وفق صلاحياتك كطبيب."
              ) : patientId ? (
                "جارٍ تحميل تفاصيل الملف…"
              ) : (
                "—"
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/doctor/patients")}
            className="no-print inline-flex h-[40px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-[#344054] hover:bg-[#F9FAFB]"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى المرضى
          </button>
        </div>

        {/* Quick Actions */}
        {patient && !patientError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 no-print"
          >
            <button
              type="button"
              onClick={() => navigate("/doctor/appointments")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-sm transition-all hover:bg-[#0d7a77] hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              حجز موعد
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/medical-records/new")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              سجل طبي جديد
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/prescriptions/new")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] bg-[#FAF5FF] px-4 font-cairo text-[12px] font-extrabold text-[#7C3AED] transition-all hover:bg-[#F3E8FF] hover:border-[#DDD6FE]"
            >
              <FileText className="h-3.5 w-3.5" />
              وصفة جديدة
            </button>
            {stateInfo?.canRequestAccess && (
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={requestAccessMutation.isPending}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#FED7AA] bg-[#FFFBEB] px-4 font-cairo text-[12px] font-extrabold text-[#B45309] transition-all hover:bg-[#FEF3C7] hover:border-[#FDBA74] disabled:opacity-60"
              >
                <Link2 className="h-3.5 w-3.5" />
                طلب وصول
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <Printer className="h-3.5 w-3.5" />
              طباعة
            </button>
          </motion.div>
        )}

        {/* إحصائيات سريعة */}
        {patient && !patientError && !accessRequired && fullProfileData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F0F9FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Stethoscope className="h-4 w-4 text-[#0EA5E9]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  الزيارات
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {encountersQuery.encounters?.length ?? 0}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FAF5FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <ClipboardList className="h-4 w-4 text-[#A855F7]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  السجلات
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.medicalHistory.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FEF2F2] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Pill className="h-4 w-4 text-[#F43F5E]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  الأدوية
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.medications.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FFFBEB] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Activity className="h-4 w-4 text-[#EAB308]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  الطلبات
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.orders.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F0FDFA] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  الملفات
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.files.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FAF5FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <FileText className="h-4 w-4 text-[#8B5CF6]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  الوصفات
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.prescriptions.length}
              </div>
            </div>
          </motion.div>
        )}

        {patientError ? (
          <DoctorListErrorState
            title="تعذّر تحميل ملف المريض"
            brief={getPatientAccessErrorMessage(patientError)}
            detail={getPatientAccessErrorMessage(patientError)}
            retrying={
              publicProfileQuery.isFetching || fullProfileQuery.isFetching
            }
            onRetry={() => {
              void publicProfileQuery.refetch();
              void fullProfileQuery.refetch();
            }}
          />
        ) : !patient ? (
          <>
            <PatientHeaderSkeleton />
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(15,143,139,0.06)]">
              <div className="flex animate-pulse flex-wrap gap-2 border-b border-[#E5E7EB] pb-5">
                {TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className="h-10 w-28 rounded-xl bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB]"
                  />
                ))}
              </div>
              <div className="pt-6">
                <PatientDetailsTabSkeleton rows={3} />
              </div>
            </div>
          </>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/95 bg-white shadow-[0_28px_64px_-18px_rgba(15,143,139,0.14),0_8px_24px_rgba(15,23,42,0.06)]">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#5eead4] via-primary to-[#0f766e]"
                aria-hidden
              />
              <div
                className="absolute inset-0 opacity-80 pointer-events-none"
                aria-hidden
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 85% 65% at 100% 0%, rgba(15,143,139,0.11), transparent 52%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(20,184,166,0.09), transparent 48%), linear-gradient(165deg, #ffffff 0%, #f8fdfc 42%, #f1faf9 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute -left-24 top-1/3 h-52 w-52 rounded-full bg-[#14b8a6]/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-primary/[0.09] blur-3xl"
                aria-hidden
              />

              <div className="relative px-5 py-7 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                  <div className="flex flex-1 gap-5 items-start min-w-0 sm:gap-6">
                    <div className="relative shrink-0">
                      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[22px] font-black tracking-wide text-white shadow-[0_18px_38px_rgba(15,143,139,0.35)] ring-[3px] ring-white/90">
                        {patientNameInitials(patient.name)}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -left-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-[#ecfdf5] text-primary shadow-sm"
                        aria-hidden
                      >
                        <UserRound className="w-3 h-3" strokeWidth={2.5} />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-cairo text-[11px] font-extrabold uppercase tracking-[0.06em] text-primary">
                        ملف المريض الطبي
                      </p>
                      <h1 className="mt-1.5 font-cairo text-[clamp(1.35rem,3.2vw,1.75rem)] font-black leading-[1.2] text-[#0f172a]">
                        {patient.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 justify-start items-center mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0]/90 bg-white/85 px-3 py-1.5 font-cairo text-[12px] font-bold text-[#475569] shadow-[0_4px_14px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                          <span className="text-[#94a3b8]">رقم الملف</span>
                          <span className="font-cairo tabular-nums text-[#0f172a]">
                            {patient.fileNo}
                          </span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-l from-[#ecfdf5] to-[#d1fae5] px-3.5 py-1 font-cairo text-[12px] font-extrabold text-[#047857] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-[#6ee7b7]/55">
                          {patient.accountStatusLabel}
                        </span>
                        {stateInfo ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
                              stateInfo.color.bg,
                              stateInfo.color.text,
                              stateInfo.color.ring,
                            )}
                          >
                            {stateInfo.label}
                          </span>
                        ) : null}
                      </div>

                      {/* Badges للتنبيهات المهمة */}
                      {(patient.allergies.length > 0 || patient.medicalConditions.length > 0) && (
                        <div className="flex flex-wrap gap-2 items-center mt-3">
                          {patient.allergies.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-2.5 py-1 shadow-sm">
                              <AlertTriangle className="h-3.5 w-3.5 text-[#DC2626]" />
                              <span className="font-cairo text-[11px] font-bold text-[#B91C1C]">
                                {patient.allergies.length} حساسية
                              </span>
                            </div>
                          )}
                          {patient.medicalConditions.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1 shadow-sm">
                              <Heart className="h-3.5 w-3.5 text-[#EA580C]" />
                              <span className="font-cairo text-[11px] font-bold text-[#C2410C]">
                                {patient.medicalConditions.length} مرض مزمن
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[340px] xl:min-w-[380px]">
                    <InfoCard
                      label="الهاتف"
                      value={patient.phone}
                      icon={Phone}
                    />
                    <InfoCard
                      label="آخر زيارة"
                      value={patient.lastVisit}
                      icon={CalendarDays}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-[0_20px_50px_rgba(15,143,139,0.06)] sm:p-6">
              <LayoutGroup id="patient-details-tabs">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#E8EAEE] p-1 sm:grid-cols-3 lg:grid-cols-5">
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: active ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                        }}
                        className={cn(
                          "relative min-h-[44px] rounded-xl px-2 py-2 text-center font-cairo text-[12px] font-black transition-colors",
                          active
                            ? "text-white shadow-[0_8px_18px_rgba(15,143,139,0.2)]"
                            : "text-[#4A5565] hover:bg-white/55",
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId="patient-details-tab-pill"
                            className="absolute inset-0 rounded-xl bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-10">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>

              <div className="relative mt-5 min-h-[240px] overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    role="tabpanel"
                    aria-label={TABS.find((t) => t.id === activeTab)?.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={TAB_PANEL_TRANSITION}
                    className="w-full"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
