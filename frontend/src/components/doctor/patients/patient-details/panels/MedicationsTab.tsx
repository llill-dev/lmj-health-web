import { motion } from "framer-motion";
import { Pill } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { useI18n } from "@/i18n/provider";

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
  const { t } = useI18n();

  if (!fullProfileData.medications.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="violet"
            imageSrc="/images/photo-not-medicines.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
            title={t("doctor.medicationsTab.emptyTitle")}
            subtitle={t("doctor.medicationsTab.emptySubtitle")}
            actionLabel={t("doctor.medicationsTab.addMedication")}
            onAction={onAddMedication}
            actionIcon={<Pill className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddMedication}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
        >
          <Pill className="h-4 w-4" />
          {t("doctor.medicationsTab.addMedicationShort")}
        </button>
      </div>
      {fullProfileData.medications.map((medication) => (
        <MedicationRecordCard key={medication.id} medication={medication} />
      ))}
    </motion.div>
  );
}
