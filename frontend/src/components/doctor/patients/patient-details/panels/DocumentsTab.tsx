import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Stethoscope,
} from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { cn } from "@/lib/utils/utils";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";
import { useI18n } from "@/i18n/provider";

import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

type ClinicalDoc = {
  id: string;
  kind: "prescription" | "order" | "record" | "encounter";
  title: string;
  subtitle: string;
  date: string;
  icon: typeof FileText;
  iconColor: string;
  iconBg: string;
};

type TFn = (key: string, fallback?: string) => string;

function buildKindLabels(t: TFn): Record<ClinicalDoc["kind"], string> {
  return {
    prescription: t("doctor.timelineTab.prescription"),
    order: t("doctor.timelineTab.medicalOrder"),
    record: t("doctor.addAccessRequestForm.medicalRecord"),
    encounter: t("doctor.timelineTab.clinicalEncounter"),
  };
}

function buildKindFilterOptions(
  t: TFn,
): Array<{ id: "all" | ClinicalDoc["kind"]; label: string }> {
  return [
    { id: "all", label: t("common.all") },
    { id: "encounter", label: t("doctor.overviewTab.encounters") },
    { id: "record", label: t("doctor.overviewTab.records") },
    { id: "prescription", label: t("doctor.overviewTab.prescriptions") },
    { id: "order", label: t("doctor.overviewTab.orders") },
  ];
}

interface DocumentsTabProps {
  fullProfileData: FullProfileData;
  encounters: DoctorEncounterSummary[];
  onOpenFiles: () => void;
  onOpenEncountersPage: () => void;
}

export function DocumentsTab({
  fullProfileData,
  encounters,
  onOpenFiles,
  onOpenEncountersPage,
}: DocumentsTabProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | ClinicalDoc["kind"]>("all");
  const kindLabels = buildKindLabels(t);
  const kindFilterOptions = buildKindFilterOptions(t);

  const docs: ClinicalDoc[] = [
    ...encounters.map((enc): ClinicalDoc => ({
      id: enc._id,
      kind: "encounter",
      title:
        enc.status === "open"
          ? t("doctor.documentsTab.clinicalEncounterOpen")
          : t("doctor.documentsTab.clinicalEncounterClosed"),
      subtitle: enc.notes || t("doctor.documentsTab.recordedClinicalEncounter"),
      date: enc.startedAt ?? enc.createdAt ?? "",
      icon: Stethoscope,
      iconColor: "text-[#0EA5E9]",
      iconBg: "bg-[#EFF6FF]",
    })),
    ...fullProfileData.medicalHistory.map((rec): ClinicalDoc => ({
      id: rec.id,
      kind: "record",
      title: rec.title,
      subtitle: rec.diagnosis,
      date: rec.date,
      icon: ClipboardList,
      iconColor: "text-[#A855F7]",
      iconBg: "bg-[#FAF5FF]",
    })),
    ...fullProfileData.prescriptions.map((presc): ClinicalDoc => ({
      id: presc.id,
      kind: "prescription",
      title: t("doctor.documentsTab.prescriptionMedCount").replace(
        "{n}",
        String(presc.items.length),
      ),
      subtitle:
        presc.items
          .slice(0, 2)
          .map((i) => i.medicationName)
          .join("، ") + (presc.items.length > 2 ? "..." : ""),
      date: presc.createdAt,
      icon: FileText,
      iconColor: "text-[#8B5CF6]",
      iconBg: "bg-[#F5F3FF]",
    })),
    ...fullProfileData.orders.map((order): ClinicalDoc => ({
      id: order.id,
      kind: "order",
      title: order.title,
      subtitle: order.status,
      date: "",
      icon: Activity,
      iconColor: "text-[#EAB308]",
      iconBg: "bg-[#FEFCE8]",
    })),
  ].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const visible = filter === "all" ? docs : docs.filter((d) => d.kind === filter);

  if (!docs.length) {
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
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
            title={t("doctor.documentsTab.emptyTitle")}
            subtitle={t("doctor.documentsTab.emptySubtitle")}
            actionLabel={t("doctor.documentsTab.viewFiles")}
            onAction={onOpenFiles}
            actionIcon={<FileText className="h-4 w-4" />}
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
      {/* فلاتر */}
      <motion.div variants={TAB_STAGGER_ITEM} className="flex flex-wrap items-center gap-2">
        {kindFilterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFilter(opt.id)}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all",
              filter === opt.id
                ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.18)]"
                : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F1F5F9]",
            )}
          >
            {opt.label}
          </button>
        ))}
        <div className="mr-auto font-cairo text-[12px] font-semibold text-[#64748B]">
          {t("doctor.documentsTab.documentCount").replace("{n}", String(visible.length))}
        </div>
      </motion.div>

      {/* قائمة الوثائق */}
      {visible.length === 0 ? (
        <motion.div variants={TAB_STAGGER_ITEM}>
          <div className="flex min-h-[160px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="font-cairo text-[14px] font-bold text-[#64748B]">
              {t("doctor.documentsTab.noFilterMatch")}
            </p>
          </div>
        </motion.div>
      ) : (
        visible.map((doc) => {
          const Icon = doc.icon;
          const kindLabel = kindLabels[doc.kind];
          return (
            <motion.article
              key={`${doc.kind}-${doc.id}`}
              variants={TAB_STAGGER_ITEM}
              className="rounded-[20px] border border-[#E2E8F0]/90 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      doc.iconBg,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", doc.iconColor)} />
                  </div>
                  <div className="min-w-0 text-start">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-cairo text-[14px] font-extrabold text-[#0F172A]">
                        {doc.title}
                      </span>
                      <span className="rounded-full bg-[#F0FDFA] px-2 py-0.5 font-cairo text-[10px] font-extrabold text-primary ring-1 ring-inset ring-[#CCFBF1]">
                        {kindLabel}
                      </span>
                    </div>
                    {doc.subtitle ? (
                      <p className="mt-1 font-cairo text-[12px] font-semibold leading-5 text-[#64748B]">
                        {doc.subtitle}
                      </p>
                    ) : null}
                    {doc.date ? (
                      <time className="mt-1 block font-cairo text-[11px] font-semibold text-[#94A3B8]">
                        {doc.date}
                      </time>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {doc.kind === "encounter" ? (
                    <button
                      type="button"
                      onClick={onOpenEncountersPage}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 font-cairo text-[12px] font-bold text-[#475467] transition-colors hover:bg-[#F8FAFC]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t("common.view")}
                    </button>
                  ) : null}
                  {doc.kind === "prescription" || doc.kind === "order" ? (
                    <button
                      type="button"
                      onClick={onOpenFiles}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t("doctor.documentsTab.files")}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.article>
          );
        })
      )}
    </motion.div>
  );
}
