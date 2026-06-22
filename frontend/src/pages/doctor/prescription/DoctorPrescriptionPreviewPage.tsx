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
} from '@/lib/doctor/doctorOrderDocuments';

export default function DoctorPrescriptionPreviewPage() {
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
        title: 'تعذّر إنشاء PDF',
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
            ? `معاينة وصفة ${preview.previewVm.patientName}`
            : 'معاينة الوصفة الطبية'}{' '}
          • LMJ Health
        </title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-8 sm:pb-10">
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
            title="تعذّر تحميل معاينة الوصفة"
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
          title="اعتماد نهائي"
          description={
            <div className="space-y-2 text-right font-cairo text-[14px] font-semibold text-[#344054]">
              <p>هل تريد اعتماد الوصفة وإرسالها للمريض؟</p>
              <p>
                المريض: <strong>{preview.previewVm?.patientName}</strong>
              </p>
              <p>
                رقم الوصفة:{' '}
                <strong>{preview.previewVm?.prescriptionCode}</strong>
              </p>
            </div>
          }
          confirmLabel="تأكيد الاعتماد"
          confirmDisabled={busy || workspace.isBusy}
          onConfirm={async () => {
            setBusy(true);
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
              toast(getUserFacingRequestErrorMessage(error), {
                title: 'تعذّر الاعتماد',
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
