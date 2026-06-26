import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import {
  RadiologyPreviewActions,
  RadiologyPreviewBanner,
  RadiologyPreviewDocument,
} from '@/components/doctor/radiology/preview';
import DoctorRadiologyHubPage from '@/pages/doctor/radiology/DoctorRadiologyHubPage';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorDocumentPreviewSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useEncounterRadiologyWorkspace,
  useRadiologyPreviewPage,
} from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { readAuthUser } from '@/lib/cookies';
import {
  generateDoctorOrderDocumentPdf,
  openPdfBlobInNewTab,
} from '@/lib/doctor/orders/doctorOrderDocuments';

export default function DoctorRadiologyPreviewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const patientId = searchParams.get('patientId') ?? '';
  const encounterId = searchParams.get('encounterId') ?? '';

  const preview = useRadiologyPreviewPage(doctorId, patientId, encounterId);
  const { retry: retryPreview, retrying: retryingPreview } = useRetryAction(
    () => Promise.resolve(preview.refetch()),
  );
  const workspace = useEncounterRadiologyWorkspace(
    doctorId,
    patientId,
    encounterId,
    Boolean(patientId && encounterId),
  );

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const editPath = `/doctor/encounters/${patientId}/${encounterId}/radiology`;

  if (!patientId || !encounterId) {
    return <DoctorRadiologyHubPage />;
  }

  const handlePdf = async () => {
    const orderId = preview.previewVm?.orderId;
    if (!orderId) return;
    setBusy(true);
    try {
      const response = await workspace.preview();
      const url =
        response.preview?.downloadUrl ??
        response.preview?.pdfUrl ??
        response.preview?.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      const blob = await generateDoctorOrderDocumentPdf({
        sourceType: 'imaging_order' as const,
        sourceId: orderId,
      });
      openPdfBlobInNewTab(blob, `imaging-order-${orderId}.pdf`);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>معاينة طلب الأشعة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-8 sm:pb-10">
        <RadiologyPreviewBanner
          patientName={preview.previewVm?.patientName}
          statusLabel={preview.previewVm?.statusLabel}
          loading={preview.isAwaitingData}
        />

        {preview.isAwaitingData ? (
          <DoctorDocumentPreviewSkeleton />
        ) : preview.isError || !preview.previewVm ? (
          <DoctorListErrorState
            title="تعذّر تحميل المعاينة"
            brief={getUserFacingRequestErrorMessage(preview.error)}
            retrying={retryingPreview}
            onRetry={() => void retryPreview()}
          />
        ) : (
          <>
            <RadiologyPreviewDocument vm={preview.previewVm} />
            <RadiologyPreviewActions
              busy={busy || workspace.isBusy}
              finalizeDisabled={!preview.previewVm.canFinalize}
              onEdit={() => navigate(editPath)}
              onCreatePdf={() => void handlePdf()}
              onFinalize={() => setFinalizeOpen(true)}
            />
          </>
        )}

        <ConfirmActionDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title="اعتماد نهائي"
          description={`اعتماد طلب الأشعة للمريض ${preview.previewVm?.patientName ?? '—'}`}
          confirmLabel="تأكيد"
          confirmDisabled={busy || workspace.isBusy}
          onConfirm={async () => {
            setBusy(true);
            try {
              await workspace.finalize();
              toast('تم اعتماد الطلب.', { variant: 'success' });
              setFinalizeOpen(false);
              navigate(
                `/doctor/encounters/${patientId}/${encounterId}/summary`,
                { replace: true },
              );
            } catch (error) {
              toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </>
  );
}
