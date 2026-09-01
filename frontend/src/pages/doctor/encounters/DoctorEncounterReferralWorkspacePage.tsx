import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import {
  getReferralWorkspaceConfig,
  ReferralWorkspaceShell,
} from "@/components/doctor/encounters/orders";
import { useToast } from "@/components/ui/ToastProvider";
import { useEncounterReferralWorkspace } from "@/hooks/doctor/encounters/useEncounterReferralWorkspace";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

export default function DoctorEncounterReferralWorkspacePage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = "", encounterId = "" } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";

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
    toast(
      locale === "ar"
        ? `تم تطبيق قالب «${appliedTemplateDraftName}» على التحويل.`
        : `The "${appliedTemplateDraftName}" template has been applied to the referral.`,
      { variant: "success" },
    );
    clearAppliedTemplateDraftName();
  }, [appliedTemplateDraftName, clearAppliedTemplateDraftName, toast, locale]);

  useEffect(() => {
    if (!templateDraftNotice) return;
    toast(templateDraftNotice, { variant: "warning" });
    clearTemplateDraftNotice();
  }, [clearTemplateDraftNotice, templateDraftNotice, toast]);

  return (
    <>
      <Helmet>
        <title>{getReferralWorkspaceConfig(t).title} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
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
