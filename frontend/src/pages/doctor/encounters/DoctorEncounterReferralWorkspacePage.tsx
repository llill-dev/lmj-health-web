import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { REFERRAL_WORKSPACE_CONFIG, ReferralWorkspaceShell } from '@/components/doctor/encounters/orders';
import { useEncounterReferralWorkspace } from '@/hooks/doctor/useEncounterReferralWorkspace';
import { readAuthUser } from '@/lib/cookies';

export default function DoctorEncounterReferralWorkspacePage() {
  const navigate = useNavigate();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const workspace = useEncounterReferralWorkspace(
    doctorId,
    patientId,
    encounterId,
  );

  return (
    <>
      <Helmet>
        <title>{REFERRAL_WORKSPACE_CONFIG.title} • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-10">
        <ReferralWorkspaceShell
          patientId={patientId}
          encounterId={encounterId}
          workspace={workspace}
          onNavigate={(path, options) => navigate(path, options)}
        />
      </div>
    </>
  );
}
