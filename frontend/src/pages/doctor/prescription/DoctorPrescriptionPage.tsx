import { useMemo, useState } from 'react';
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
import { resolvePrescriptionSaveFeedback } from '@/lib/doctor/prescriptionFormErrors';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { readAuthUser } from '@/lib/cookies';

export default function DoctorPrescriptionPage() {
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
  );

  const editable = isPrescriptionEditable(
    workspace.prescription,
    workspace.encounter?.status,
  );

  const editingMedication = useMemo(
    () => workspace.medications.find((item) => item.id === editingItemId),
    [editingItemId, workspace.medications],
  );

  const handleAddOrUpdateMedication = async (values: PrescriptionDraftForm) => {
    try {
      if (editingItemId) {
        await workspace.updateItem({ itemId: editingItemId, values });
        toast('تم تحديث الدواء.', { title: 'الوصفة الطبية', variant: 'success' });
      } else {
        await workspace.addItem(values);
        toast('تمت إضافة الدواء.', { title: 'الوصفة الطبية', variant: 'success' });
      }
      setEditingItemId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: 'تعذّر حفظ الدواء',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMedication = async () => {
    if (!deleteTargetId) return;
    try {
      await workspace.deleteItem(deleteTargetId);
      toast('تم حذف الدواء.', { title: 'الوصفة الطبية', variant: 'success' });
      setDeleteTargetId(null);
    } catch (error) {
      toast(workspace.getErrorMessage(error), {
        title: 'تعذّر حذف الدواء',
        variant: 'error',
      });
    }
  };

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title="رابط غير صالح"
        brief="معرّف المريض أو الزيارة مفقود."
        onRetry={() => navigate('/doctor/prescription')}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {patientName
            ? `الوصفة الطبية — ${patientName}`
            : 'الوصفة الطبية'}{' '}
          • LMJ Health
        </title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-10">
        {workspace.isAwaitingData ? (
          <DoctorWorkspaceFormSkeleton medicationCards={3} />
        ) : workspace.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الوصفة الطبية"
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
              <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-right font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                هذه الوصفة للعرض فقط (زيارة مغلقة أو وصفة معتمدة نهائياً).
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
                  toast('تم نسخ الدواء.', { variant: 'success' });
                } catch (error) {
                  toast(workspace.getErrorMessage(error), {
                    title: 'تعذّر نسخ الدواء',
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
                  toast(response.message ?? 'تم حفظ المسودة.', {
                    title: 'حفظ المسودة',
                    variant: 'success',
                  });
                } catch (error) {
                  const { toastMessage, fields } =
                    resolvePrescriptionSaveFeedback(error);
                  if (fields.generalInstructions) {
                    setGeneralInstructionsError(fields.generalInstructions);
                  }
                  toast(toastMessage, {
                    title: 'تعذّر حفظ المسودة',
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
                    title: 'تعذّر فتح المعاينة',
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
          title={editingItemId ? 'تعديل الدواء' : 'إضافة دواء'}
          confirmLabel={editingItemId ? 'حفظ التعديل' : 'إضافة للوصفة'}
          initialValues={editingMedication}
          onSubmit={handleAddOrUpdateMedication}
        />

        <ConfirmActionDialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
          title="حذف الدواء"
          description="هل تريد حذف هذا الدواء من الوصفة؟"
          confirmLabel="حذف"
          confirmDisabled={workspace.isBusy}
          onConfirm={handleDeleteMedication}
        />

        <ConfirmActionDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title="اعتماد نهائي"
          description={
            <div className="space-y-2 text-right font-cairo text-[14px] font-semibold text-[#344054]">
              <p>
                سيتم اعتماد الوصفة نهائياً للمريض{' '}
                <strong>{patientName || '—'}</strong> ومزامنة الأدوية مع ملف المريض.
              </p>
              <p>
                عدد الأدوية: <strong>{workspace.medications.length}</strong>
              </p>
              {workspace.medications.length === 0 ? (
                <p className="text-[#B45309]">
                  يجب إضافة دواء واحد على الأقل قبل الاعتماد (حسب API).
                </p>
              ) : null}
            </div>
          }
          confirmLabel="تأكيد الاعتماد"
          confirmDisabled={workspace.isBusy || workspace.medications.length === 0}
          onConfirm={async () => {
            try {
              const response = await workspace.finalize();
              toast(response.message ?? 'تم اعتماد الوصفة نهائياً.', {
                title: 'اعتماد نهائي',
                variant: 'success',
              });
              setFinalizeOpen(false);
              navigate(
                `/doctor/encounters/${patientId}/${encounterId}/summary`,
                { replace: true },
              );
            } catch (error) {
              toast(workspace.getErrorMessage(error), {
                title: 'تعذّر الاعتماد',
                variant: 'error',
              });
            }
          }}
        />
      </div>
    </>
  );
}
