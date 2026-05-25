import { motion } from "framer-motion";

import { MedicalHistoryRecordCard } from "../cards";
import { TAB_STAGGER_CONTAINER } from "../constants";
import { EmptyPanel } from "./EmptyPanel";
import type { FullProfileData } from "../types";

export function HistoryTab({ fullProfileData }: { fullProfileData: FullProfileData }) {
  return fullProfileData.medicalHistory.length ? (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      {fullProfileData.medicalHistory.map((record, idx) => (
        <MedicalHistoryRecordCard key={record.id} record={record} index={idx + 1} />
      ))}
    </motion.div>
  ) : (
    <EmptyPanel message="لا توجد سجلات طبية مرتبطة بهذا المريض." />
  );
}
