import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import {
  PrescriptionActionButtons,
  PrescriptionAddMedicationButton,
  PrescriptionAddMedicationDialog,
  PrescriptionGeneralInstructions,
  PrescriptionPageHeader,
  PrescriptionSelectedMedications,
  type PrescriptionDraftForm,
} from "@/components/doctor/prescription";
import {
  isPrescriptionEditable,
  resolvePatientPrescriptionName,
  resolvePrescriptionStatusLabel,
} from "@/components/doctor/prescription/map-prescription-ui";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorWorkspaceFormSkeleton } from "@/components/doctor/shared/skeletons";
import { useToast } from "@/components/ui/ToastProvider";
import { useEncounterPrescriptionWorkspace } from "@/hooks/doctor";
import { resolvePrescriptionSaveFeedback } from "@/lib/doctor/prescriptions/prescriptionFormErrors";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

export default function DoctorPrescriptionPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = "", encounterId = "" } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";

  const workspace = useEncounterPrescriptionWorkspace(
    doctorId,
    patientId,
    encounterId,
  );
  const { retry: retryWorkspace, retrying: retryingWorkspace } = useRetryAction(
    () => Promise.resolve(workspace.refetch()),
  );

  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [generalInstructionsError, setGeneralInstructionsError] = useState<
    string | null
  >(null);

  const patientName = useMemo(
    () =>
      resolvePatientPrescriptionName(
        workspace.prescription,
        workspace.encounter?.patient?.user?.fullName,
      ),
    [workspace.encounter?.patient, workspace.prescription],
  );

  const patientFileNumber = useMemo(() => {
    const file =
      workspace.prescription?.patient?.publicId?.trim() ??
      workspace.encounter?.patient?.publicId?.trim() ??
      "";
    if (!file) return undefined;
    return file.startsWith("P-") || file.startsWith("#") ? file : `P-${file}`;
  }, [workspace.encounter?.patient, workspace.prescription]);

  const statusLabel = resolvePrescriptionStatusLabel(
    workspace.prescription?.status,
    (ar: string, en: string) => (locale === "ar" ? ar : en),
  );

  const editable = isPrescriptionEditable(
    workspace.prescription,
    workspace.encounter?.status,
  );

  const appliedTemplateDraftName = workspace.appliedTemplateDraftName;
  const clearAppliedTemplateDraftName = workspace.clearAppliedTemplateDraftName;
  const templateDraftNotice = workspace.templateDraftNotice;
  const clearTemplateDraftNotice = workspace.clearTemplateDraftNotice;

  useEffect(() => {
    if (!appliedTemplateDraftName) return;
    toast(
      locale === "ar"
        ? `تم تطبيق قالب «${appliedTemplateDraftName}» على الوصفة.`
        : `Template "${appliedTemplateDraftName}" was applied to the prescription.`,
      {
        variant: "success",
      },
    );
    clearAppliedTemplateDraftName();
  }, [appliedTemplateDraftName, clearAppliedTemplateDraftName, toast, locale]);

  useEffect(() => {
    if (!templateDraftNotice) return;
    toast(templateDraftNotice, { variant: "warning" });
    clearTemplateDraftNotice();
  }, [clearTemplateDraftNotice, templateDraftNotice, toast]);

  const editingMedication = useMemo(
    () => workspace.medications.find((item) => item.id === editingItemId),
    [editingItemId, workspace.medications],
  );

  const handleAddOrUpdateMedication = async (values: PrescriptionDraftForm) => {
    try {
      if (editingItemId) {
        await workspace.updateItem({ itemId: editingItemId, values });
        toast(t("doctor.prescription.medicationUpdated"), {
          title: t("doctor.prescription.pageTitle"),
          variant: "success",
        });
      } else {
        await workspace.addItem(values);
        toast(t("doctor.prescription.medicationAdded"), {
          title: t("doctor.prescription.pageTitle"),
          variant: "success",
        });
      }
      setEditingItemId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: t("doctor.prescription.saveMedicationError"),
        variant: "error",
      });
      throw error;
    }
  };

  const handleDeleteMedication = async () => {
    if (!deleteTargetId) return;
    try {
      await workspace.deleteItem(deleteTargetId);
      toast(t("doctor.prescription.medicationDeleted"), {
        title: t("doctor.prescription.pageTitle"),
        variant: "success",
      });
      setDeleteTargetId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: t("doctor.prescription.deleteMedicationError"),
        variant: "error",
      });
    }
  };

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title={t("doctor.prescription.invalidLink")}
        brief={t("doctor.prescription.missingId")}
        onRetry={() => navigate("/doctor/prescription")}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {patientName
            ? locale === "ar"
              ? `الوصفة الطبية — ${patientName}`
              : `Prescription — ${patientName}`
            : t("doctor.prescription.pageTitle")}{" "}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        {workspace.isAwaitingData ? (
          <DoctorWorkspaceFormSkeleton medicationCards={3} />
        ) : workspace.isError ? (
          <DoctorListErrorState
            title={t("doctor.prescription.loadFailed")}
            brief={workspace.getErrorMessage(workspace.error)}
            retrying={retryingWorkspace}
            onRetry={() => void retryWorkspace()}
          />
        ) : (
          <>
            <PrescriptionPageHeader
              patientName={patientName}
              fileNumber={patientFileNumber}
              statusLabel={statusLabel}
              backTo={`/doctor/encounters/${patientId}/${encounterId}`}
            />

            {!editable ? (
              <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                {t("doctor.prescription.viewOnly")}
              </div>
            ) : null}

            <PrescriptionAddMedicationButton
              onClick={() => {
                setEditingItemId(null);
                setMedicationDialogOpen(true);
              }}
              disabled={!editable || workspace.isBusy}
            />

            <PrescriptionSelectedMedications
              items={workspace.medications}
              onEdit={(id) => {
                if (!editable) return;
                setEditingItemId(id);
                setMedicationDialogOpen(true);
              }}
              onDelete={(id) => {
                if (!editable) return;
                setDeleteTargetId(id);
              }}
              onDuplicate={async (id) => {
                if (!editable) return;
                try {
                  await workspace.duplicateItem(id);
                  toast(t("doctor.prescription.medicationDuplicated"), {
                    variant: "success",
                  });
                } catch (error) {
                  toast(workspace.getErrorMessage(error), {
                    title: t("doctor.prescription.duplicateMedicationError"),
                    variant: "error",
                  });
                }
              }}
            />

            <PrescriptionGeneralInstructions
              value={workspace.generalInstructions}
              onChange={(value) => {
                setGeneralInstructionsError(null);
                workspace.setGeneralInstructions(value);
              }}
              disabled={!editable || workspace.isBusy}
              error={generalInstructionsError ?? undefined}
            />

            <PrescriptionActionButtons
              saving={workspace.isBusy}
              disabled={!editable}
              onSaveDraft={async () => {
                if (!editable) return;
                setGeneralInstructionsError(null);
                try {
                  const response = await workspace.saveDraft();
                  toast(
                    response.message ?? t("doctor.prescription.draftSaved"),
                    {
                      title: t("doctor.prescription.saveDraft"),
                      variant: "success",
                    },
                  );
                } catch (error) {
                  const { toastMessage, fields } =
                    resolvePrescriptionSaveFeedback(error, t);
                  if (fields.generalInstructions) {
                    setGeneralInstructionsError(fields.generalInstructions);
                  }
                  toast(toastMessage, {
                    title: t("doctor.prescription.saveDraftError"),
                    variant: "error",
                  });
                }
              }}
              onPreview={async () => {
                try {
                  await workspace.saveDraft();
                  navigate(
                    `/doctor/prescription?patientId=${encodeURIComponent(patientId)}&encounterId=${encodeURIComponent(encounterId)}`,
                  );
                } catch (error) {
                  toast(workspace.getErrorMessage(error), {
                    title: t("doctor.prescription.previewError"),
                    variant: "error",
                  });
                }
              }}
              onFinalize={() => setFinalizeOpen(true)}
            />
          </>
        )}

        <PrescriptionAddMedicationDialog
          open={medicationDialogOpen && editable}
          onOpenChange={(open) => {
            setMedicationDialogOpen(open);
            if (!open) setEditingItemId(null);
          }}
          title={
            editingItemId
              ? t("doctor.prescription.editMedication")
              : t("doctor.prescription.addMedication")
          }
          confirmLabel={
            editingItemId
              ? t("doctor.prescription.saveChanges")
              : t("doctor.prescription.addToPrescription")
          }
          initialValues={editingMedication}
          onSubmit={handleAddOrUpdateMedication}
        />

        <ConfirmActionDialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
          title={t("doctor.prescription.deleteMedicationTitle")}
          description={t("doctor.prescription.deleteMedicationDescription")}
          confirmLabel={t("doctor.prescription.delete")}
          confirmDisabled={workspace.isBusy}
          onConfirm={handleDeleteMedication}
        />

        <ConfirmActionDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title={t("doctor.prescription.finalize")}
          description={
            <div className="space-y-2 text-start font-cairo text-[14px] font-semibold text-[#344054]">
              <p>
                {t("doctor.prescription.finalizeDescription1")}{" "}
                <strong>{patientName || "—"}</strong>{" "}
                {t("doctor.prescription.finalizeDescription2")}
              </p>
              <p>
                {t("doctor.prescription.medicationsCount")}{" "}
                <strong>{workspace.medications.length}</strong>
              </p>
              {workspace.medications.length === 0 ? (
                <p className="text-[#B45309]">
                  {t("doctor.prescription.atLeastOneRequired")}
                </p>
              ) : null}
            </div>
          }
          confirmLabel={t("doctor.prescription.confirmFinalization")}
          confirmDisabled={
            workspace.isBusy || workspace.medications.length === 0
          }
          onConfirm={async () => {
            try {
              const response = await workspace.finalize();
              toast(response.message ?? t("doctor.prescription.finalized"), {
                title: t("doctor.prescription.finalize"),
                variant: "success",
              });
              setFinalizeOpen(false);
              navigate(
                `/doctor/encounters/${patientId}/${encounterId}/summary`,
                { replace: true },
              );
            } catch (error) {
              toast(workspace.getErrorMessage(error), {
                title: t("doctor.prescription.finalizeError"),
                variant: "error",
              });
            }
          }}
        />
      </div>
    </>
  );
}
