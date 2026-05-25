import { motion } from "framer-motion";
import { Pill } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";

import { MedicationRecordCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

export function MedicationsTab({
  fullProfileData,
  onAddMedication,
}: {
  fullProfileData: FullProfileData;
  onAddMedication: () => void;
}) {
  if (!fullProfileData.medications.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="violet"
            imageSrc="/images/photo-not-medicines.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
            title="لا توجد أدوية مسجّلة بعد"
            subtitle="قم بإضافة أدوية المريض الآن"
            actionLabel="إضافة أدوية"
            onAction={onAddMedication}
            actionIcon={<Pill className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      {fullProfileData.medications.map((medication) => (
        <MedicationRecordCard key={medication.id} medication={medication} />
      ))}
    </motion.div>
  );
}
