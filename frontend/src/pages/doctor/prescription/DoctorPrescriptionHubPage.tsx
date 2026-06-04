import { type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PrescriptionPageHeader,
  PrescriptionVisitExpandableCard,
} from '@/components/doctor/prescription';
import type { MedicalVisitCardData } from '@/components/doctor/encounters/types';
import {
  ENCOUNTERS_LIST_ITEM,
  ENCOUNTERS_LIST_STAGGER,
} from '@/components/doctor/encounters/encounters-motion';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import {
  useDoctorMedicalEncountersPage,
  usePrescriptionPreviewPage,
} from '@/hooks/doctor';
import { readAuthUser } from '@/lib/cookies';
import { getUserFacingRequestErrorMessage } from '@/lib/api';

const DEFAULT_FILTERS = {
  search: '',
  status: 'open' as const,
  dateFrom: '',
  dateTo: '',
};

function PrescriptionVisitCardRow({
  visit,
  doctorId,
  expanded,
  onToggle,
  onOpenPreview,
  onOpenEdit,
}: {
  visit: MedicalVisitCardData;
  doctorId: string;
  expanded: boolean;
  onToggle: () => void;
  onOpenPreview: () => void;
  onOpenEdit: () => void;
}) {
  const preview = usePrescriptionPreviewPage(
    doctorId,
    visit.patientId,
    visit.id,
    expanded,
  );

  return (
    <PrescriptionVisitExpandableCard
      visit={visit}
      expanded={expanded}
      detailsLoading={expanded && preview.isLoading}
      detailsError={
        expanded && preview.isError && !preview.previewVm
          ? getUserFacingRequestErrorMessage(preview.error)
          : null
      }
      previewVm={preview.previewVm}
      onToggle={onToggle}
      onOpenPreview={onOpenPreview}
      onOpenEdit={onOpenEdit}
    />
  );
}

export default function DoctorPrescriptionHubPage() {
  const navigate = useNavigate();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const { visits, isLoading, isError, error, refetch } =
    useDoctorMedicalEncountersPage(doctorId, DEFAULT_FILTERS);

  const openVisits = useMemo(
    () => visits.filter((visit) => visit.status === 'open'),
    [visits],
  );

  const buildPrescriptionUrl = (patientId: string, encounterId: string) =>
    `/doctor/prescription?patientId=${encodeURIComponent(patientId)}&encounterId=${encodeURIComponent(encounterId)}`;

  const buildEditUrl = (patientId: string, encounterId: string) =>
    `/doctor/encounters/${patientId}/${encounterId}/prescription`;

  let listContent: ReactNode;

  if (isLoading) {
    listContent = (
      <div className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white px-4 py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        جارٍ تحميل الزيارات المفتوحة...
      </div>
    );
  } else if (isError) {
    listContent = (
      <DoctorListErrorState
        title="تعذّر تحميل الزيارات"
        brief={getUserFacingRequestErrorMessage(error)}
        onRetry={refetch}
      />
    );
  } else if (openVisits.length === 0) {
    listContent = (
      <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] px-4 py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        لا توجد زيارات مفتوحة. ابدأ زيارة جديدة من «الزيارات الطبية» ثم افتح
        الوصفة من هنا.
      </div>
    );
  } else {
    listContent = (
      <motion.div
        variants={ENCOUNTERS_LIST_STAGGER}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {openVisits.map((visit) => (
            <motion.div
              key={visit.id}
              layout
              variants={ENCOUNTERS_LIST_ITEM}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <PrescriptionVisitCardRow
                visit={visit}
                doctorId={doctorId}
                expanded={expandedVisitId === visit.id}
                onToggle={() =>
                  setExpandedVisitId((current) =>
                    current === visit.id ? null : visit.id,
                  )
                }
                onOpenPreview={() =>
                  navigate(buildPrescriptionUrl(visit.patientId, visit.id))
                }
                onOpenEdit={() =>
                  navigate(buildEditUrl(visit.patientId, visit.id))
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>الوصفة الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="pb-10 w-full">
        <PrescriptionPageHeader
          patientLabel="الزيارات المفتوحة — اختر وصفة لعرض التفاصيل"
          statusLabel="قائمة"
          backTo="/doctor/encounters"
        />
        {listContent}
      </div>
    </>
  );
}
