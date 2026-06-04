import { type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RadiologyPageHeader, RadiologyVisitExpandableCard } from '@/components/doctor/radiology';
import {
  formatRadiologyOrderCode,
  resolveRadiologyStatusLabel,
} from '@/components/doctor/radiology/map-radiology-ui';
import type { MedicalVisitCardData } from '@/components/doctor/encounters/types';
import {
  ENCOUNTERS_LIST_ITEM,
  ENCOUNTERS_LIST_STAGGER,
} from '@/components/doctor/encounters/encounters-motion';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import {
  useDoctorMedicalEncountersPage,
  useEncounterRadiologyWorkspace,
} from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { readAuthUser } from '@/lib/cookies';

const DEFAULT_FILTERS = {
  search: '',
  status: 'open' as const,
  dateFrom: '',
  dateTo: '',
};

function RadiologyVisitCardRow({
  visit,
  doctorId,
  expanded,
  onToggle,
}: {
  visit: MedicalVisitCardData;
  doctorId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const workspace = useEncounterRadiologyWorkspace(
    doctorId,
    visit.patientId,
    visit.id,
    expanded,
  );

  const items = expanded ? workspace.items : [];
  const statusLabel = workspace.order
    ? resolveRadiologyStatusLabel(workspace.order)
    : 'مسودة';
  const orderCode = workspace.order?._id
    ? formatRadiologyOrderCode(workspace.order._id)
    : undefined;

  const base = `/doctor/encounters/${visit.patientId}/${visit.id}/radiology`;

  return (
    <RadiologyVisitExpandableCard
      visit={visit}
      expanded={expanded}
      onToggle={onToggle}
      detailsLoading={expanded && workspace.isLoading}
      detailsError={
        expanded && workspace.isError
          ? getUserFacingRequestErrorMessage(workspace.error)
          : null
      }
      items={items}
      statusLabel={statusLabel}
      orderCode={orderCode}
      onViewDetails={() => navigate(base)}
      onOpenPreview={() =>
        navigate(
          `/doctor/radiology?patientId=${encodeURIComponent(visit.patientId)}&encounterId=${encodeURIComponent(visit.id)}`,
        )
      }
    />
  );
}

export default function DoctorRadiologyHubPage() {
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const { visits, isLoading, isError, error, refetch } =
    useDoctorMedicalEncountersPage(doctorId, DEFAULT_FILTERS);

  const openVisits = useMemo(
    () => visits.filter((v) => v.status === 'open'),
    [visits],
  );

  let listContent: ReactNode;

  if (isLoading) {
    listContent = (
      <div className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        جارٍ تحميل الزيارات...
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
      <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        لا توجد زيارات مفتوحة لطلبات الأشعة.
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
            >
              <RadiologyVisitCardRow
                visit={visit}
                doctorId={doctorId}
                expanded={expandedVisitId === visit.id}
                onToggle={() =>
                  setExpandedVisitId((c) => (c === visit.id ? null : visit.id))
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
        <title>طلبات الأشعة • LMJ Health</title>
      </Helmet>
      <div dir="rtl" lang="ar" className="w-full pb-10">
        <RadiologyPageHeader
          patientName="الزيارات المفتوحة"
          statusLabel="قائمة"
          backTo="/doctor/encounters"
        />
        {listContent}
      </div>
    </>
  );
}
