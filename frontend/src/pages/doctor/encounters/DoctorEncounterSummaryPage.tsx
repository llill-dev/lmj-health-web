import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  EncounterSummaryActions,
  EncounterSummaryBody,
  EncounterSummaryFinishDialog,
  EncounterSummaryHeader,
} from '@/components/doctor/encounters/summary';
import { EncounterDocumentsPanel } from '@/components/doctor/encounters/summary/encounter-documents-panel';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorSummaryPageSkeleton } from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import { useDoctorEncounterSummary } from '@/hooks/doctor';
import { readAuthUser } from '@/lib/cookies';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import {
  generateDoctorDocumentPdf,
  openPdfBlobInNewTab,
} from '@/lib/doctor/orders/doctorOrderDocuments';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { useI18n } from '@/i18n/provider';

export default function DoctorEncounterSummaryPage() {
  const { locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const {
    summary,
    encounter,
    exportPdfSource,
    documentLinkCandidates,
    isAwaitingData,
    isError,
    error,
    profileDenied,
    refetch,
  } = useDoctorEncounterSummary(doctorId, patientId, encounterId);
  const { retry: retrySummary, retrying: retryingSummary } = useRetryAction(
    () => Promise.resolve(refetch()),
  );

  const handleExportPdf = async () => {
    if (!exportPdfSource) {
      toast(
        'لا توجد وصفة أو طلب معتمد لتصديره. اعتماد الوصفة أو الطلبات يفعّل التصدير.',
        { title: 'تصدير PDF', variant: 'info' },
      );
      return;
    }
    setExportingPdf(true);
    try {
      const blob = await generateDoctorDocumentPdf(exportPdfSource);
      openPdfBlobInNewTab(
        blob,
        `encounter-${encounterId}-${exportPdfSource.sourceType}.pdf`,
      );
    } catch (requestError) {
      toast(getUserFacingRequestErrorMessage(requestError), {
        title: 'تعذّر تصدير PDF',
        variant: 'error',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleFinishConfirm = async () => {
    setFinishing(true);
    try {
      toast('تم حفظ مراجعة ملخص الزيارة.', {
        title: 'إنهاء الزيارة',
        variant: 'success',
      });
      setFinishConfirmOpen(false);
      navigate('/doctor/encounters', { replace: true });
    } finally {
      setFinishing(false);
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
        <title>ملخص الزيارة الطبية • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <EncounterSummaryHeader />

        {isAwaitingData ? (
          <DoctorSummaryPageSkeleton />
        ) : isError || !summary || !encounter ? (
          <DoctorListErrorState
            title="تعذّر تحميل ملخص الزيارة"
            brief={getUserFacingRequestErrorMessage(error)}
            retrying={retryingSummary}
            onRetry={() => void retrySummary()}
          />
        ) : (
          <>
            {profileDenied ? (
              <div className="mb-4 rounded-[12px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B45309]">
                بعض بيانات الملف الكامل غير متاحة؛ يُعرض الملخص من بيانات الزيارة
                والملف العام.
              </div>
            ) : null}

            {encounter.status !== 'closed' ? (
              <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                هذه الزيارة ما زالت مفتوحة. الملخص يعرض التوثيق الحالي قبل
                الإغلاق النهائي.
              </div>
            ) : summary.closedAtLabel ? (
              <div className="mb-4 rounded-[12px] border border-[#BFEDEC] bg-[#E6F4F3] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-primary">
                تم إغلاق الزيارة: {summary.closedAtLabel}
              </div>
            ) : null}

            <EncounterSummaryBody summary={summary} />
            <div className="my-6">
              <EncounterDocumentsPanel
                doctorId={doctorId}
                patientId={patientId}
                encounterId={encounterId}
                linkCandidates={documentLinkCandidates}
              />
            </div>
            <EncounterSummaryActions
              onExportPdf={() => void handleExportPdf()}
              onFinish={() => setFinishConfirmOpen(true)}
              finishing={finishing}
              exportingPdf={exportingPdf}
            />

            <EncounterSummaryFinishDialog
              open={finishConfirmOpen}
              onOpenChange={setFinishConfirmOpen}
              summary={summary}
              encounterStatus={encounter.status}
              confirmDisabled={finishing}
              onConfirm={handleFinishConfirm}
            />
          </>
        )}
      </div>
    </>
  );
}
