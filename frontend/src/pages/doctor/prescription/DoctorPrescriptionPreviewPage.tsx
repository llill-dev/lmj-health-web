import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import {
  PrescriptionPreviewActions,
  PrescriptionPreviewBanner,
  PrescriptionPreviewDocument,
} from '@/components/doctor/prescription/preview';
import DoctorPrescriptionHubPage from '@/pages/doctor/prescription/DoctorPrescriptionHubPage';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorDocumentPreviewSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useEncounterPrescriptionWorkspace,
  usePrescriptionPreviewPage,
} from '@/hooks/doctor';
import { readAuthUser } from '@/lib/cookies';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import {
  generateDoctorDocumentPdf,
  openPdfBlobInNewTab,
} from '@/lib/doctor/orders/doctorOrderDocuments';
import { useI18n } from '@/i18n/provider';

export default function DoctorPrescriptionPreviewPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const patientId = searchParams.get('patientId') ?? '';
  const encounterId = searchParams.get('encounterId') ?? '';

  const preview = usePrescriptionPreviewPage(doctorId, patientId, encounterId);
  const { retry: retryPreview, retrying: retryingPreview } = useRetryAction(
    () => Promise.resolve(preview.refetch()),
  );
  const workspace = useEncounterPrescriptionWorkspace(
    doctorId,
    patientId,
    encounterId,
    Boolean(patientId && encounterId),
  );

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const editPath = useMemo(
    () => `/doctor/encounters/${patientId}/${encounterId}/prescription`,
    [encounterId, patientId],
  );

  if (!patientId || !encounterId) {
    return <DoctorPrescriptionHubPage />;
  }

  const handleCreatePdf = async () => {
    const prescriptionId = preview.previewVm?.prescriptionId;
    if (!prescriptionId) return;
    setBusy(true);
    try {
      const blob = await generateDoctorDocumentPdf({
        sourceType: 'prescription',
        sourceId: prescriptionId,
      });
      openPdfBlobInNewTab(blob, `prescription-${prescriptionId}.pdf`);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر إنشاء PDF', 'Could not create PDF'),
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {preview.previewVm?.patientName
            ? tr(`معاينة وصفة ${preview.previewVm.patientName}`, `Prescription preview — ${preview.previewVm.patientName}`)
            : tr('معاينة الوصفة الطبية', 'Prescription preview')}{' '}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <PrescriptionPreviewBanner
          patientName={preview.previewVm?.patientName}
          statusLabel={preview.previewVm?.statusLabel}
          loading={preview.isAwaitingData}
          backTo="/doctor/prescription"
        />

        {preview.isAwaitingData ? (
          <DoctorDocumentPreviewSkeleton />
        ) : preview.isError || !preview.previewVm ? (
          <DoctorListErrorState
            title={tr('تعذّر تحميل معاينة الوصفة', 'Failed to load the prescription preview')}
            brief={getUserFacingRequestErrorMessage(preview.error)}
            retrying={retryingPreview}
            onRetry={() => void retryPreview()}
          />
        ) : (
          <>
            <PrescriptionPreviewDocument vm={preview.previewVm} />

            <PrescriptionPreviewActions
              busy={busy || workspace.isBusy}
              finalizeDisabled={!preview.previewVm.canFinalize}
              onEdit={() => navigate(editPath)}
              onCreatePdf={() => void handleCreatePdf()}
              onFinalize={() => setFinalizeOpen(true)}
            />
          </>
        )}

        <ConfirmActionDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title={tr('اعتماد نهائي', 'Finalize')}
          description={
            <div className="space-y-2 text-start font-cairo text-[14px] font-semibold text-[#344054]">
              <p>{tr('هل تريد اعتماد الوصفة وإرسالها للمريض؟', 'Do you want to finalize the prescription and send it to the patient?')}</p>
              <p>
                {tr('المريض:', 'Patient:')} <strong>{preview.previewVm?.patientName}</strong>
              </p>
              <p>
                {tr('رقم الوصفة:', 'Prescription number:')}{' '}
                <strong>{preview.previewVm?.prescriptionCode}</strong>
              </p>
            </div>
          }
          confirmLabel={tr('تأكيد الاعتماد', 'Confirm finalization')}
          confirmDisabled={busy || workspace.isBusy}
          onConfirm={async () => {
            setBusy(true);
            try {
              const response = await workspace.finalize();
              toast(response.message ?? tr('تم اعتماد الوصفة نهائياً.', 'The prescription was finalized.'), {
                title: tr('اعتماد نهائي', 'Finalized'),
                variant: 'success',
              });
              setFinalizeOpen(false);
              navigate(
                `/doctor/encounters/${patientId}/${encounterId}/summary`,
                { replace: true },
              );
            } catch (error) {
              toast(getUserFacingRequestErrorMessage(error), {
                title: tr('تعذّر الاعتماد', 'Could not finalize'),
                variant: 'error',
              });
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </>
  );
}
