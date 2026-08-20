import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";

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
            title="لا توجد سجلات طبية بعد"
            subtitle="يمكنك إضافة أول سجل طبي لهذا المريض الآن"
            actionLabel="إضافة سجل طبي"
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
