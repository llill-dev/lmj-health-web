import { motion } from "framer-motion";
import { FileText } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";

import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";

export function DocumentsTab({ onOpenFiles }: { onOpenFiles: () => void }) {
  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
      <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
        <PatientTabEmptyIllustration
          variant="violet"
          imageSrc="/images/photo-not-medicines.png"
          imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
          title="الوثائق السريرية غير مربوطة بعد"
          subtitle="الـ API يدعم وثائق encounter المرتبطة بالوصفات والطلبات وملفات المريض، لكن هذا المسار لم يُنفّذ بعد داخل الملف."
          actionLabel="عرض الملفات الحالية"
          onAction={onOpenFiles}
          actionIcon={<FileText className="h-4 w-4" />}
        />
      </motion.div>
    </motion.div>
  );
}
