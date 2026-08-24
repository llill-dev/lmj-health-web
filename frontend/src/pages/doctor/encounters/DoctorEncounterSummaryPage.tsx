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
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
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
        tr(
          'لا توجد وصفة أو طلب معتمد لتصديره. اعتماد الوصفة أو الطلبات يفعّل التصدير.',
          'There is no finalized prescription or order to export. Finalizing the prescription or orders enables export.',
        ),
        { title: tr('تصدير PDF', 'Export PDF'), variant: 'info' },
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
        title: tr('تعذّر تصدير PDF', 'Could not export PDF'),
        variant: 'error',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleFinishConfirm = async () => {
    setFinishing(true);
    try {
      toast(tr('تم حفظ مراجعة ملخص الزيارة.', 'The encounter summary review was saved.'), {
        title: tr('إنهاء الزيارة', 'Finish encounter'),
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
        title={tr('رابط غير صالح', 'Invalid link')}
        brief={tr('معرّف المريض أو الزيارة مفقود.', 'The patient or encounter ID is missing.')}
        onRetry={() => navigate('/doctor/encounters')}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{tr('ملخص الزيارة الطبية', 'Encounter summary')} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <EncounterSummaryHeader />

        {isAwaitingData ? (
          <DoctorSummaryPageSkeleton />
        ) : isError || !summary || !encounter ? (
          <DoctorListErrorState
            title={tr('تعذّر تحميل ملخص الزيارة', 'Failed to load the encounter summary')}
            brief={getUserFacingRequestErrorMessage(error)}
            retrying={retryingSummary}
            onRetry={() => void retrySummary()}
          />
        ) : (
          <>
            {profileDenied ? (
              <div className="mb-4 rounded-[12px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B45309]">
                {tr(
                  'بعض بيانات الملف الكامل غير متاحة؛ يُعرض الملخص من بيانات الزيارة والملف العام.',
                  'Some full-profile data is not available; the summary is shown from encounter and public profile data.',
                )}
              </div>
            ) : null}

            {encounter.status !== 'closed' ? (
              <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#1D4ED8]">
                {tr(
                  'هذه الزيارة ما زالت مفتوحة. الملخص يعرض التوثيق الحالي قبل الإغلاق النهائي.',
                  'This encounter is still open. The summary shows the current documentation before final closure.',
                )}
              </div>
            ) : summary.closedAtLabel ? (
              <div className="mb-4 rounded-[12px] border border-[#BFEDEC] bg-[#E6F4F3] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-primary">
                {tr('تم إغلاق الزيارة:', 'Encounter closed:')} {summary.closedAtLabel}
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
