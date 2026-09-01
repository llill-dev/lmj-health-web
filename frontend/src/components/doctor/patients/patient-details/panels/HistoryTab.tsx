import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { useI18n } from "@/i18n/provider";

import { MedicalHistoryRecordCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

export function HistoryTab({
  fullProfileData,
  onAddRecord,
}: {
  fullProfileData: FullProfileData;
  onAddRecord: () => void;
}) {
  const { t } = useI18n();

  if (!fullProfileData.medicalHistory.length) {
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
            title={t("doctor.historyTab.emptyTitle")}
            subtitle={t("doctor.historyTab.emptySubtitle")}
            actionLabel={t("doctor.historyTab.addRecord")}
            onAction={onAddRecord}
            actionIcon={<ClipboardList className="h-4 w-4" />}
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
      {fullProfileData.medicalHistory.map((record, idx) => (
        <MedicalHistoryRecordCard key={record.id} record={record} index={idx + 1} />
      ))}
    </motion.div>
  );
}
