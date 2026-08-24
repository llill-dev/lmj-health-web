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
import { useI18n } from '@/i18n/provider';

export default function DoctorRadiologyPreviewPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
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
        <title>{tr('معاينة طلب الأشعة', 'Radiology order preview')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <RadiologyPreviewBanner
          patientName={preview.previewVm?.patientName}
          statusLabel={preview.previewVm?.statusLabel}
          loading={preview.isAwaitingData}
        />

        {preview.isAwaitingData ? (
          <DoctorDocumentPreviewSkeleton />
        ) : preview.isError || !preview.previewVm ? (
          <DoctorListErrorState
            title={tr('تعذّر تحميل المعاينة', 'Failed to load the preview')}
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
          title={tr('اعتماد نهائي', 'Final approval')}
          description={tr(
            `اعتماد طلب الأشعة للمريض ${preview.previewVm?.patientName ?? '—'}`,
            `Approve the radiology order for patient ${preview.previewVm?.patientName ?? '—'}`,
          )}
          confirmLabel={tr('تأكيد', 'Confirm')}
          confirmDisabled={busy || workspace.isBusy}
          onConfirm={async () => {
            setBusy(true);
            try {
              await workspace.finalize();
              toast(tr('تم اعتماد الطلب.', 'The order has been approved.'), { variant: 'success' });
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
