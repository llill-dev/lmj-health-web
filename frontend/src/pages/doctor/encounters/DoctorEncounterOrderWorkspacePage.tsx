import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ENCOUNTER_ORDER_CONFIG,
  EncounterOrderWorkspaceShell,
  type CatalogOrderCategory,
} from '@/components/doctor/encounters/orders';
import { useEncounterOrderWorkspace } from '@/hooks/doctor/useEncounterOrderWorkspace';
import { readAuthUser } from '@/lib/cookies';

export default function DoctorEncounterOrderWorkspacePage({
  category,
}: {
  category: CatalogOrderCategory;
}) {
  const navigate = useNavigate();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const config = ENCOUNTER_ORDER_CONFIG[category];

  const workspace = useEncounterOrderWorkspace(
    category,
    doctorId,
    patientId,
    encounterId,
  );

  const patientName = useMemo(
    () => workspace.encounter?.patient?.user?.fullName?.trim() ?? '',
    [workspace.encounter?.patient?.user?.fullName],
  );

  const fileNumber = useMemo(() => {
    const id = workspace.encounter?.patient?.publicId?.trim();
    if (!id) return undefined;
    return id.startsWith('P-') || id.startsWith('#') ? id : `P-${id}`;
  }, [workspace.encounter?.patient?.publicId]);

  return (
    <>
      <Helmet>
        <title>
          {patientName ? `${config.title} — ${patientName}` : config.title} • LMJ
          Health
        </title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-10">
        <EncounterOrderWorkspaceShell
          category={category}
          patientId={patientId}
          encounterId={encounterId}
          workspace={workspace}
          patientName={patientName}
          fileNumber={fileNumber}
          onNavigate={(path, options) => navigate(path, options)}
        />
      </div>
    </>
  );
}
