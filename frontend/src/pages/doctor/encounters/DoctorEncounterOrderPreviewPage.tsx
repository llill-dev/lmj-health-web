import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import {
  RadiologyPreviewActions,
  RadiologyPreviewBanner,
  RadiologyPreviewDocument,
} from '@/components/doctor/radiology/preview';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorDocumentPreviewSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import { useEncounterOrderPreviewPage } from '@/hooks/doctor/useEncounterOrderPreviewPage';
import { useEncounterOrderWorkspace } from '@/hooks/doctor/useEncounterOrderWorkspace';
import {
  generateDoctorOrderDocumentPdf,
  openPdfBlobInNewTab,
} from '@/lib/doctor/doctorOrderDocuments';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { readAuthUser } from '@/lib/cookies';

export default function DoctorEncounterOrderPreviewPage({
  category,
}: {
  category: CatalogOrderCategory;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';

  const preview = useEncounterOrderPreviewPage(
    category,
    doctorId,
    patientId,
    encounterId,
  );
  const { retry: retryPreview, retrying: retryingPreview } = useRetryAction(
    () => Promise.resolve(preview.refetch()),
  );
  const workspace = useEncounterOrderWorkspace(
    category,
    doctorId,
    patientId,
    encounterId,
    Boolean(patientId && encounterId),
  );

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const editPath = preview.config.workspacePath(patientId, encounterId);

  const handlePdf = async () => {
    if (!preview.previewVm?.orderId) return;
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
        sourceType: preview.config.pdfSourceType as 'order' | 'imaging_order',
        sourceId: preview.previewVm.orderId,
      });
      openPdfBlobInNewTab(blob, `${preview.config.title}.pdf`);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title="رابط غير صالح"
        brief="معرّف المريض أو الزيارة مفقود."
        onRetry={() => navigate('/doctor/encounters')}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>معاينة {preview.config.title} • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full pb-10">
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
          description={`اعتماد ${preview.config.title} للمريض ${preview.previewVm?.patientName ?? '—'}`}
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
