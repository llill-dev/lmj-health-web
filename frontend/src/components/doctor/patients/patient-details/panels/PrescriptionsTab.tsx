import { motion } from "framer-motion";
import { FileText } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";

import { PrescriptionCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

export function PrescriptionsTab({
  fullProfileData,
  onCreatePrescription,
}: {
  fullProfileData: FullProfileData;
  onCreatePrescription: () => void;
}) {
  if (!fullProfileData.prescriptions.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="violet"
            imageSrc="/images/photo-not-medicines.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
            title="لا توجد وصفات طبية مسجّلة"
            subtitle="يمكنك إنشاء أول وصفة طبية لهذا المريض"
            actionLabel="إنشاء وصفة"
            onAction={onCreatePrescription}
            actionIcon={<FileText className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      {fullProfileData.prescriptions.map((prescription, index) => (
        <PrescriptionCard key={prescription.id} prescription={prescription} index={index + 1} />
      ))}
    </motion.div>
  );
}
