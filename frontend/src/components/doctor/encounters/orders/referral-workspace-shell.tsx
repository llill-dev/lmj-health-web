'use client';

import { useCallback, useState } from 'react';
import { Save, Send } from 'lucide-react';
import type { ReferralFormFieldMessages } from '@/lib/doctor/referrals/referralFormSchema';
import {
  ReferralFormSubmitError,
  assertReferralFormValid,
} from '@/lib/doctor/referrals/referralFormSchema';
import type { ReferralFormState } from '@/lib/doctor/referrals/referralFormSchema';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import { RadiologyPageHeader } from '@/components/doctor/radiology';
import { EncounterWorkspacePatientCard } from '@/components/doctor/encounters/workspace/encounter-workspace-patient-card';
import { mapEncounterWorkspacePatient } from '@/components/doctor/encounters/workspace/map-encounter-workspace';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';
import type { useEncounterReferralWorkspace } from '@/hooks/doctor/encounters/useEncounterReferralWorkspace';
import { getReferralWorkspaceConfig } from './encounter-order-config';
import { ReferralCreateForm } from './referral-create-form';

type Workspace = ReturnType<typeof useEncounterReferralWorkspace>;

export function ReferralWorkspaceShell({
  patientId,
  encounterId,
  workspace,
  onNavigate,
}: {
  patientId: string;
  encounterId: string;
  workspace: Workspace;
  onNavigate: (path: string, options?: { replace?: boolean }) => void;
}) {
  const { locale, t } = useI18n();
  const config = getReferralWorkspaceConfig(t);
  const { toast } = useToast();
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReferralFormFieldMessages>({});

  const handleFormChange = useCallback(
    (next: ReferralFormState) => {
      workspace.setForm(next);
      setFieldErrors({});
    },
    [workspace],
  );

  const handleSubmitError = useCallback(
    (error: unknown, toastTitle: string) => {
      setFieldErrors(workspace.getFieldErrors(error));
      toast(workspace.getErrorMessage(error), {
        title: toastTitle,
        variant: 'error',
        durationMs: 5200,
      });
    },
    [workspace, toast],
  );

  const backTo = config.hubPath(patientId, encounterId);
  const patientName =
    workspace.encounter?.patient?.user?.fullName?.trim() ?? '';
  const publicId = workspace.encounter?.patient?.publicId?.trim();
  const fileNumber = publicId
    ? publicId.startsWith('P-') || publicId.startsWith('#')
      ? publicId
      : `P-${publicId}`
    : undefined;

  const patientVm = workspace.encounter
    ? mapEncounterWorkspacePatient(
        workspace.encounter,
        undefined,
        publicId,
        locale,
      )
    : null;

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title="رابط غير صالح"
        brief="معرّف المريض أو الزيارة مفقود."
        onRetry={() => onNavigate(backTo)}
      />
    );
  }

  if (workspace.isAwaitingData) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E2E8F0] bg-white font-cairo text-[14px] font-semibold text-[#667085]">
        {config.loadingLabel}
      </div>
    );
  }

  if (workspace.isError) {
    return (
      <DoctorListErrorState
        title={config.errorTitle}
        brief={workspace.getErrorMessage(workspace.error)}
        onRetry={workspace.refetch}
      />
    );
  }

  return (
    <>
      <RadiologyPageHeader
        patientName={patientName}
        fileNumber={fileNumber}
        statusLabel={workspace.statusLabel}
        backTo={backTo}
        title={config.title}
      />

      {patientVm ? (
        <div className="mb-4">
          <EncounterWorkspacePatientCard patient={patientVm} />
        </div>
      ) : null}

      <ReferralCreateForm
        value={workspace.form}
        onChange={handleFormChange}
        fieldErrors={fieldErrors}
        disabled={!workspace.isEditable || workspace.isBusy}
      />

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={workspace.isBusy || !workspace.isEditable}
          onClick={async () => {
            try {
              setFieldErrors({});
              const res = await workspace.save();
              toast(res.message ?? 'تم حفظ التحويل كمسودة.', {
                title: 'تم الحفظ',
                variant: 'success',
              });
            } catch (error) {
              handleSubmitError(error, 'تعذّر حفظ التحويل');
            }
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] disabled:opacity-60"
        >
          <Save className="h-5 w-5" aria-hidden />
          حفظ كمسودة
        </button>
        <button
          type="button"
          disabled={workspace.isBusy || !workspace.isEditable}
          onClick={() => {
            try {
              assertReferralFormValid(workspace.form, 'finalize');
              setFieldErrors({});
              setFinalizeOpen(true);
            } catch (error) {
              handleSubmitError(error, 'بيانات التحويل غير مكتملة');
            }
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] disabled:opacity-60"
        >
          <Send className="h-5 w-5" aria-hidden />
          إرسال التحويل
        </button>
      </div>

      <ConfirmActionDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        title="اعتماد التحويل"
        description="اعتماد التحويل الطبي وإرساله ضمن سجل الزيارة."
        confirmLabel="تأكيد"
        confirmDisabled={workspace.isBusy}
        onConfirm={async () => {
          try {
            setFieldErrors({});
            await workspace.finalize();
            toast('تم اعتماد التحويل.', {
              title: 'تم الاعتماد',
              variant: 'success',
            });
            setFinalizeOpen(false);
            onNavigate(backTo, { replace: true });
          } catch (error) {
            if (error instanceof ReferralFormSubmitError) {
              setFinalizeOpen(false);
            }
            handleSubmitError(error, 'تعذّر اعتماد التحويل');
          }
        }}
      />
    </>
  );
}
