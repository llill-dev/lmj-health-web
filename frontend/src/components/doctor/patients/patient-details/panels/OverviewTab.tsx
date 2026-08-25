import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Clock,
  FileText,
  Heart,
  Link2,
  Pill,
  ShieldAlert,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { InfoCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData, PatientDetailsTab } from "../types";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

type OverviewPatient = {
  bloodType?: string | null;
  heightLabel?: string;
  weightLabel?: string;
  measurementUnitLabel?: string;
  allergies: string[];
  medicalConditions: string[];
};

type OverviewStateInfo = {
  canViewFullProfile: boolean;
  canRequestAccess?: boolean;
  icon?: "alert" | "link" | "clock" | "hourglass" | "stethoscope" | "check";
  color: {
    bg: string;
    text: string;
    border?: string;
  };
};

type OverviewStateMessage = {
  body: string;
};

interface OverviewTabProps {
  patient: OverviewPatient | null;
  fullProfileData: FullProfileData | null;
  encountersCount: number;
  appointmentsCount: number;
  appointmentsLoading?: boolean;
  hasOpenEncounter: boolean;
  accessRequired: boolean;
  stateInfo: OverviewStateInfo | null;
  stateMessage: OverviewStateMessage | null;
  requestAccessPending: boolean;
  onRequestAccess: () => void;
  onSelectTab: (tab: PatientDetailsTab) => void;
}

function OverviewStatCard({
  icon,
  value,
  label,
  active,
  tone,
  onClick,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  active?: boolean;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#E2E8F0] p-4 text-start transition-all hover:shadow-lg",
        tone,
      )}
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          {icon}
          {active ? (
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
          ) : null}
        </div>
        <div className="font-cairo text-[24px] font-black text-[#0F172A]">
          {value}
        </div>
        <div className="font-cairo text-[11px] font-bold text-[#64748B]">
          {label}
        </div>
      </div>
    </button>
  );
}

function AccessIcon({
  icon,
}: {
  icon?: "alert" | "link" | "clock" | "hourglass" | "stethoscope" | "check";
}) {
  const Icon: LucideIcon =
    icon === "alert"
      ? ShieldAlert
      : icon === "link"
        ? Link2
        : icon === "clock" || icon === "hourglass"
          ? Clock
          : Stethoscope;

  return <Icon className="h-5 w-5" />;
}

export function OverviewTab({
  patient,
  fullProfileData,
  encountersCount,
  appointmentsCount,
  appointmentsLoading = false,
  hasOpenEncounter,
  accessRequired,
  stateInfo,
  stateMessage,
  requestAccessPending,
  onRequestAccess,
  onSelectTab,
}: OverviewTabProps) {
  const { t } = useI18n();
  const filesCount = fullProfileData?.files.length ?? 0;
  const ordersCount = fullProfileData?.orders.length ?? 0;
  const medicationsCount = fullProfileData?.medications.length ?? 0;
  const prescriptionsCount = fullProfileData?.prescriptions.length ?? 0;
  const historyCount = fullProfileData?.medicalHistory.length ?? 0;
  const latestEncounter = encountersCount > 0 ? encountersCount : 0;
  const latestFile = fullProfileData?.files[0] ?? null;

  return (
    <motion.div
      variants={TAB_STAGGER_CONTAINER}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={TAB_STAGGER_ITEM}>
        <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
          {t("doctor.overviewTab.quickIndicators")}
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <OverviewStatCard
            icon={<CalendarDays className="h-5 w-5 text-primary" />}
            value={appointmentsLoading ? "…" : appointmentsCount}
            label={t("doctor.overviewTab.totalAppointments")}
            tone="bg-gradient-to-br from-[#f0fdfa] to-white hover:border-primary"
            onClick={() => onSelectTab("appointments")}
          />
          <OverviewStatCard
            icon={<Stethoscope className="h-5 w-5 text-[#0EA5E9]" />}
            value={encountersCount}
            label={t("doctor.overviewTab.encounters")}
            active={hasOpenEncounter}
            tone="bg-gradient-to-br from-[#f0f9ff] to-white hover:border-[#0EA5E9]"
            onClick={() => onSelectTab("encounters")}
          />
          <OverviewStatCard
            icon={<ClipboardList className="h-5 w-5 text-[#A855F7]" />}
            value={historyCount}
            label={t("doctor.overviewTab.records")}
            tone="bg-gradient-to-br from-[#faf5ff] to-white hover:border-[#A855F7]"
            onClick={() => onSelectTab("history")}
          />
          <OverviewStatCard
            icon={<Pill className="h-5 w-5 text-[#F43F5E]" />}
            value={medicationsCount}
            label={t("doctor.overviewTab.medications")}
            tone="bg-gradient-to-br from-[#fef3f2] to-white hover:border-[#F43F5E]"
            onClick={() => onSelectTab("medications")}
          />
          <OverviewStatCard
            icon={<FileText className="h-5 w-5 text-[#8B5CF6]" />}
            value={prescriptionsCount}
            label={t("doctor.overviewTab.prescriptions")}
            tone="bg-gradient-to-br from-[#faf5ff] to-white hover:border-[#8B5CF6]"
            onClick={() => onSelectTab("prescriptions")}
          />
          <OverviewStatCard
            icon={<Activity className="h-5 w-5 text-[#EAB308]" />}
            value={ordersCount}
            label={t("doctor.overviewTab.orders")}
            tone="bg-gradient-to-br from-[#fefce8] to-white hover:border-[#EAB308]"
            onClick={() => onSelectTab("tests")}
          />
          <OverviewStatCard
            icon={<FileText className="h-5 w-5 text-primary" />}
            value={filesCount}
            label={t("doctor.overviewTab.files")}
            tone="bg-gradient-to-br from-[#f0fdfa] to-white hover:border-primary"
            onClick={() => onSelectTab("files")}
          />
        </div>
      </motion.div>

      {stateInfo && !stateInfo.canViewFullProfile && stateMessage ? (
        <motion.div variants={TAB_STAGGER_ITEM}>
          <div
            className={cn(
              "rounded-2xl border px-5 py-4",
              stateInfo.color.border ?? "border-[#E2E8F0]",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  stateInfo.color.text,
                )}
              >
                <AccessIcon icon={stateInfo.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-cairo text-[14px] font-extrabold text-[#101828]">
                  {t("doctor.overviewTab.accessStatus")}
                </h4>
                <p className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#475467]">
                  {stateMessage.body}
                </p>
                {stateInfo.canRequestAccess ? (
                  <button
                    type="button"
                    onClick={onRequestAccess}
                    disabled={requestAccessPending}
                    className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-cairo text-[12px] font-extrabold text-white transition-colors hover:bg-[#0d7a77] disabled:opacity-60"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {t("doctor.overviewTab.sendAccessRequest")}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {!accessRequired ? (
        <>
          <motion.div variants={TAB_STAGGER_ITEM}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-cairo text-[15px] font-black text-[#101828]">
                {t("doctor.overviewTab.latestActivity")}
              </h3>
              {(latestEncounter > 0 || latestFile) && (
                <button
                  type="button"
                  onClick={() => onSelectTab("timeline")}
                  className="font-cairo text-[12px] font-bold text-primary hover:underline"
                >
                  {t("doctor.overviewTab.viewTimeline")}
                </button>
              )}
            </div>

            {latestEncounter === 0 && !latestFile ? (
              <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                <p className="mt-3 font-cairo text-[14px] font-bold text-[#64748B]">
                  {t("doctor.overviewTab.noActivityYet")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE]/60 text-[#0EA5E9]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                        {t("doctor.overviewTab.encounters")}
                      </div>
                      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#0F172A]">
                        {hasOpenEncounter
                          ? t("doctor.overviewTab.openEncounter")
                          : t("doctor.overviewTab.recordedEncounters").replace(
                              "{n}",
                              String(encountersCount),
                            )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F8FAFC] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cairo text-[11px] font-bold text-[#64748B]">
                        {t("doctor.overviewTab.latestFile")}
                      </div>
                      <div className="mt-1 truncate font-cairo text-[13px] font-extrabold text-[#0F172A]">
                        {latestFile?.name ?? t("doctor.overviewTab.noFiles")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={TAB_STAGGER_ITEM}>
            <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
              {t("doctor.overviewTab.basicInfo")}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label={t("doctor.overviewTab.bloodType")} value={patient?.bloodType ?? "—"} icon={Heart} />
              <InfoCard label={t("doctor.overviewTab.height")} value={patient?.heightLabel ?? "—"} />
              <InfoCard label={t("doctor.overviewTab.weight")} value={patient?.weightLabel ?? "—"} />
              <InfoCard label={t("doctor.overviewTab.measurementUnit")} value={patient?.measurementUnitLabel ?? "—"} />
            </div>
          </motion.div>

          <motion.div variants={TAB_STAGGER_ITEM}>
            <h3 className="mb-3 font-cairo text-[15px] font-black text-[#101828]">
              {t("doctor.overviewTab.allergiesAndConditions")}
            </h3>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl bg-[#FEF2F2] px-4 py-4">
                <div className="mb-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[#B42318]" />
                  <span className="font-cairo text-[14px] font-extrabold text-[#B42318]">
                    {t("doctor.overviewTab.allergies")}
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
                      {t("doctor.overviewTab.noAllergies")}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[#FFF4ED] px-4 py-4">
                <div className="mb-3 flex items-start gap-2">
                  <Heart className="h-5 w-5 shrink-0 text-[#EA580C]" />
                  <span className="font-cairo text-[14px] font-extrabold text-[#C4320A]">
                    {t("doctor.overviewTab.chronicConditions")}
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
                      {t("doctor.overviewTab.noChronicConditions")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </motion.div>
  );
}
