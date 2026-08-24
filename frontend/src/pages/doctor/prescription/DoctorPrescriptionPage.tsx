import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import {
  PrescriptionActionButtons,
  PrescriptionAddMedicationButton,
  PrescriptionAddMedicationDialog,
  PrescriptionGeneralInstructions,
  PrescriptionPageHeader,
  PrescriptionSelectedMedications,
  type PrescriptionDraftForm,
} from '@/components/doctor/prescription';
import {
  isPrescriptionEditable,
  resolvePatientPrescriptionName,
  resolvePrescriptionStatusLabel,
} from '@/components/doctor/prescription/map-prescription-ui';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorWorkspaceFormSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import { useEncounterPrescriptionWorkspace } from '@/hooks/doctor';
import { resolvePrescriptionSaveFeedback } from '@/lib/doctor/prescriptions/prescriptionFormErrors';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { readAuthUser } from '@/lib/cookies';
import { useI18n } from '@/i18n/provider';

export default function DoctorPrescriptionPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

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
      '';
    if (!file) return undefined;
    return file.startsWith('P-') || file.startsWith('#') ? file : `P-${file}`;
  }, [workspace.encounter?.patient, workspace.prescription]);

  const statusLabel = resolvePrescriptionStatusLabel(
    workspace.prescription?.status,
    tr,
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
      tr(
        `تم تطبيق قالب «${appliedTemplateDraftName}» على الوصفة.`,
        `Template "${appliedTemplateDraftName}" was applied to the prescription.`,
      ),
      {
        variant: 'success',
      },
    );
    clearAppliedTemplateDraftName();
  }, [appliedTemplateDraftName, clearAppliedTemplateDraftName, toast, tr]);

  useEffect(() => {
    if (!templateDraftNotice) return;
    toast(templateDraftNotice, { variant: 'warning' });
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
        toast(tr('تم تحديث الدواء.', 'The medication was updated.'), {
          title: tr('الوصفة الطبية', 'Prescription'),
          variant: 'success',
        });
      } else {
        await workspace.addItem(values);
        toast(tr('تمت إضافة الدواء.', 'The medication was added.'), {
          title: tr('الوصفة الطبية', 'Prescription'),
          variant: 'success',
        });
      }
      setEditingItemId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: tr('تعذّر حفظ الدواء', 'Could not save the medication'),
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMedication = async () => {
    if (!deleteTargetId) return;
    try {
      await workspace.deleteItem(deleteTargetId);
      toast(tr('تم حذف الدواء.', 'The medication was deleted.'), {
        title: tr('الوصفة الطبية', 'Prescription'),
        variant: 'success',
      });
      setDeleteTargetId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: tr('تعذّر حذف الدواء', 'Could not delete the medication'),
        variant: 'error',
      });
    }
  };

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title={tr('رابط غير صالح', 'Invalid link')}
        brief={tr('معرّف المريض أو الزيارة مفقود.', 'The patient or encounter ID is missing.')}
        onRetry={() => navigate('/doctor/prescription')}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {patientName
            ? tr(`الوصفة الطبية — ${patientName}`, `Prescription — ${patientName}`)
            : tr('الوصفة الطبية', 'Prescription')}{' '}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        {workspace.isAwaitingData ? (
          <DoctorWorkspaceFormSkeleton medicationCards={3} />
        ) : workspace.isError ? (
          <DoctorListErrorState
            title={tr('تعذّر تحميل الوصفة الطبية', 'Failed to load the prescription')}
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
                {tr('هذه الوصفة للعرض فقط (زيارة مغلقة أو وصفة معتمدة نهائياً).', 'This prescription is view-only (closed visit or finalized prescription).')}
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
                  toast(tr('تم نسخ الدواء.', 'The medication was duplicated.'), { variant: 'success' });
                } catch (error) {
                  toast(workspace.getErrorMessage(error), {
                    title: tr('تعذّر نسخ الدواء', 'Could not duplicate the medication'),
                    variant: 'error',
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
                  toast(response.message ?? tr('تم حفظ المسودة.', 'The draft was saved.'), {
                    title: tr('حفظ المسودة', 'Save draft'),
                    variant: 'success',
                  });
                } catch (error) {
                  const { toastMessage, fields } =
                    resolvePrescriptionSaveFeedback(error);
                  if (fields.generalInstructions) {
                    setGeneralInstructionsError(fields.generalInstructions);
                  }
                  toast(toastMessage, {
                    title: tr('تعذّر حفظ المسودة', 'Could not save the draft'),
                    variant: 'error',
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
                    title: tr('تعذّر فتح المعاينة', 'Could not open the preview'),
                    variant: 'error',
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
          title={editingItemId ? tr('تعديل الدواء', 'Edit medication') : tr('إضافة دواء', 'Add medication')}
          confirmLabel={editingItemId ? tr('حفظ التعديل', 'Save changes') : tr('إضافة للوصفة', 'Add to prescription')}
          initialValues={editingMedication}
          onSubmit={handleAddOrUpdateMedication}
        />

        <ConfirmActionDialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
          title={tr('حذف الدواء', 'Delete medication')}
          description={tr('هل تريد حذف هذا الدواء من الوصفة؟', 'Do you want to delete this medication from the prescription?')}
          confirmLabel={tr('حذف', 'Delete')}
          confirmDisabled={workspace.isBusy}
          onConfirm={handleDeleteMedication}
        />

        <ConfirmActionDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title={tr('اعتماد نهائي', 'Finalize')}
          description={
            <div className="space-y-2 text-start font-cairo text-[14px] font-semibold text-[#344054]">
              <p>
                {tr('سيتم اعتماد الوصفة نهائياً للمريض', 'The prescription will be finalized for the patient')}{' '}
                <strong>{patientName || '—'}</strong> {tr('ومزامنة الأدوية مع ملف المريض.', 'and sync the medications with the patient file.')}
              </p>
              <p>
                {tr('عدد الأدوية:', 'Medications count:')} <strong>{workspace.medications.length}</strong>
              </p>
              {workspace.medications.length === 0 ? (
                <p className="text-[#B45309]">
                  {tr('يجب إضافة دواء واحد على الأقل قبل الاعتماد (حسب API).', 'At least one medication must be added before finalizing (per the API).')}
                </p>
              ) : null}
            </div>
          }
          confirmLabel={tr('تأكيد الاعتماد', 'Confirm finalization')}
          confirmDisabled={workspace.isBusy || workspace.medications.length === 0}
          onConfirm={async () => {
            try {
              const response = await workspace.finalize();
              toast(response.message ?? tr('تم اعتماد الوصفة نهائياً.', 'The prescription was finalized.'), {
                title: tr('اعتماد نهائي', 'Finalize'),
                variant: 'success',
              });
              setFinalizeOpen(false);
              navigate(
                `/doctor/encounters/${patientId}/${encounterId}/summary`,
                { replace: true },
              );
            } catch (error) {
              toast(workspace.getErrorMessage(error), {
                title: tr('تعذّر الاعتماد', 'Could not finalize'),
                variant: 'error',
              });
            }
          }}
        />
      </div>
    </>
  );
}
