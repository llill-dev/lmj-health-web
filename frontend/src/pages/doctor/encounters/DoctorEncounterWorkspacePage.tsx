import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  EncounterWorkspaceHeader,
  EncounterWorkspacePageSkeleton,
  EncounterWorkspacePatientCard,
  EncounterWorkspaceSectionCard,
  EncounterWorkspaceSectionsSkeleton,
  type EncounterWorkspaceSectionKey,
} from "@/components/doctor/encounters/workspace";
import { ENCOUNTER_WORKSPACE_SECTION_PATHS } from "@/components/doctor/encounters/workspace/encounter-workspace-types";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useCloseDoctorPatientEncounter,
  useEncounterWorkspace,
} from "@/hooks/doctor";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { doctorPatientsQueryKeys } from "@/lib/doctor/client";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

const DEFAULT_EXPANDED_SECTIONS: Record<EncounterWorkspaceSectionKey, boolean> =
  {
    prescription: true,
    lab: true,
    radiology: true,
    procedure: false,
    referral: true,
  };

export default function DoctorEncounterWorkspacePage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = "", encounterId = "" } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";
  const authUser = readAuthUser();
  const doctorName = authUser?.fullName?.trim()
    ? locale === "ar" && !/^د\.?\s/u.test(authUser.fullName)
      ? `د. ${authUser.fullName}`
      : authUser.fullName
    : t("doctor.encounter.workspace.doctor");

  const [expandedSections, setExpandedSections] = useState(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [closeOpen, setCloseOpen] = useState(false);

  const queryClient = useQueryClient();
  const workspace = useEncounterWorkspace(doctorId, patientId, encounterId);
  const { retry: retryWorkspace, retrying: retryingWorkspace } = useRetryAction(
    () => Promise.resolve(workspace.refetch()),
  );
  const closeEncounterMutation = useCloseDoctorPatientEncounter(doctorId);

  const sections = workspace.sections;

  const toggleSection = (key: EncounterWorkspaceSectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openSection = (key: EncounterWorkspaceSectionKey) => {
    navigate(ENCOUNTER_WORKSPACE_SECTION_PATHS[key](patientId, encounterId));
  };

  const handleSaveProgress = () => {
    void retryWorkspace();
    toast(t("doctor.encounter.workspace.refreshed"), {
      title: t("doctor.encounter.workspace.saveProgress"),
      variant: "success",
    });
  };

  const handleCloseEncounter = async () => {
    if (!patientId || !encounterId) return;
    try {
      const response = await closeEncounterMutation.mutateAsync({
        patientId,
        encounterId,
      });
      toast(response.message ?? t("doctor.encounter.workspace.closedSuccess"), {
        title: t("doctor.encounter.workspace.closeEncounter"),
        variant: "success",
      });
      setCloseOpen(false);
      await queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterSummary(
          doctorId,
          patientId,
          encounterId,
        ),
      });
      navigate(`/doctor/encounters/${patientId}/${encounterId}/summary`, {
        replace: true,
      });
    } catch (requestError) {
      toast(getUserFacingRequestErrorMessage(requestError), {
        title: t("doctor.encounter.workspace.closeFailed"),
        variant: "error",
      });
      throw requestError;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.encounter.workspace.pageTitle")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full">
        <EncounterWorkspaceHeader doctorName={doctorName} />

        {workspace.isAwaitingEncounterData ? (
          <EncounterWorkspacePageSkeleton />
        ) : workspace.isError ||
          !workspace.encounter ||
          !workspace.patientVm ? (
          <DoctorListErrorState
            title={t("doctor.encounter.workspace.loadFailed")}
            brief={getUserFacingRequestErrorMessage(workspace.error)}
            detail={getUserFacingRequestErrorMessage(workspace.error)}
            retrying={retryingWorkspace}
            onRetry={() => void retryWorkspace()}
          />
        ) : (
          <div className="space-y-4">
            <EncounterWorkspacePatientCard
              patient={workspace.patientVm}
              isEnriching={workspace.isAwaitingPatientEnrichment}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openSection("prescription")}
                className="flex h-12 w-full items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9]"
              >
                {t("doctor.encounter.workspace.openPrescription")}
              </button>
              <button
                type="button"
                onClick={() => openSection("radiology")}
                className="flex h-12 w-full items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9]"
              >
                {t("doctor.encounter.workspace.openImaging")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => openSection("lab")}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                {t("doctor.encounter.workspace.labOrders")}
              </button>
              <button
                type="button"
                onClick={() => openSection("procedure")}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                {t("doctor.encounter.workspace.procedureOrders")}
              </button>
              <button
                type="button"
                onClick={() => openSection("referral")}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                {t("doctor.encounter.workspace.referrals")}
              </button>
            </div>

            {workspace.isAwaitingSectionsData ? (
              <EncounterWorkspaceSectionsSkeleton />
            ) : (
              <div className="space-y-4">
                {sections.map((section) => (
                  <EncounterWorkspaceSectionCard
                    key={section.key}
                    section={section}
                    expanded={
                      expandedSections[section.key] ??
                      section.defaultExpanded ??
                      false
                    }
                    onToggle={() => toggleSection(section.key)}
                    onOpenSection={() => openSection(section.key)}
                    onAddReferral={() => openSection("referral")}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCloseOpen(true)}
                disabled={
                  workspace.encounter.status === "closed" ||
                  closeEncounterMutation.isPending
                }
                className="inline-flex h-12 items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeEncounterMutation.isPending
                  ? t("doctor.encounter.workspace.closing")
                  : t("doctor.encounter.workspace.closeEncounter")}
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={retryingWorkspace}
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
              >
                {retryingWorkspace
                  ? t("doctor.encounter.workspace.refreshing")
                  : t("doctor.encounter.workspace.refreshFromServer")}
              </button>
            </div>

            {workspace.profileDenied ? (
              <div className="rounded-[12px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B45309]">
                {t("doctor.encounter.workspace.profileDenied")}
              </div>
            ) : null}
          </div>
        )}

        <ConfirmActionDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title={t("doctor.encounter.workspace.confirmCloseTitle")}
          description={t("doctor.encounter.workspace.confirmCloseDesc")}
          confirmLabel={t("doctor.encounter.workspace.confirmCloseLabel")}
          confirmDisabled={closeEncounterMutation.isPending}
          onConfirm={handleCloseEncounter}
        />

        <div className="h-10" />
      </div>
    </>
  );
}
