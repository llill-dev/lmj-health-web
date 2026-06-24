import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { REFERRAL_WORKSPACE_CONFIG, ReferralWorkspaceShell } from '@/components/doctor/encounters/orders';
import { useToast } from '@/components/ui/ToastProvider';
import { useEncounterReferralWorkspace } from '@/hooks/doctor/useEncounterReferralWorkspace';
import { readAuthUser } from '@/lib/cookies';

export default function DoctorEncounterReferralWorkspacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const workspace = useEncounterReferralWorkspace(
    doctorId,
    patientId,
    encounterId,
  );

  const appliedTemplateDraftName = workspace.appliedTemplateDraftName;
  const clearAppliedTemplateDraftName = workspace.clearAppliedTemplateDraftName;
  const templateDraftNotice = workspace.templateDraftNotice;
  const clearTemplateDraftNotice = workspace.clearTemplateDraftNotice;

  useEffect(() => {
    if (!appliedTemplateDraftName) return;
    toast(`تم تطبيق قالب «${appliedTemplateDraftName}» على التحويل.`, {
      variant: 'success',
    });
    clearAppliedTemplateDraftName();
  }, [appliedTemplateDraftName, clearAppliedTemplateDraftName, toast]);

  useEffect(() => {
    if (!templateDraftNotice) return;
    toast(templateDraftNotice, { variant: 'warning' });
    clearTemplateDraftNotice();
  }, [clearTemplateDraftNotice, templateDraftNotice, toast]);

  return (
    <>
      <Helmet>
        <title>{REFERRAL_WORKSPACE_CONFIG.title} • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-8 sm:pb-10">
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
