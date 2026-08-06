import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  LabResultDialog,
  MedicalRequestDetailsDialog,
  MedicalRequestUpdateStatusDialog,
  MedicalRequestUploadResultDialog,
  MedicalRequestsPageHeader,
  MedicalRequestsPagination,
  MedicalRequestsStatCards,
  MedicalRequestsTable,
  MedicalRequestsToolbar,
  RadiologyViewerDialog,
  mapDoctorOrderToDetail,
  resolveMedicalRequestReorderPath,
  type MedicalRequestRowVm,
} from '@/components/doctor/medical-requests';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from '@/components/doctor/shared/skeletons';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useDoctorMedicalRequestDetails,
  useDoctorMedicalRequestStats,
  useDoctorMedicalRequests,
  useDoctorOrderMutations,
} from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { useRetryAction } from '@/lib/query/useRetryAction';
import type { DoctorOrderCategory } from '@/lib/doctor/orders/doctorOrderTypes';
import { useI18n } from '@/i18n/provider';

export default function DoctorMedicalRequestsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Exclude<DoctorOrderCategory, 'all'>>('lab');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const [selectedRow, setSelectedRow] = useState<MedicalRequestRowVm | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [radiologyOpen, setRadiologyOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [uploadResultOpen, setUploadResultOpen] = useState(false);

  const list = useDoctorMedicalRequests({ tab, search, page, limit });
  const stats = useDoctorMedicalRequestStats(search);
  const orderMutations = useDoctorOrderMutations();
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    list.refetch(),
  );

  const detailsQuery = useDoctorMedicalRequestDetails(
    selectedRow?.id ?? null,
    detailsOpen || labOpen || radiologyOpen || statusOpen || uploadResultOpen,
    selectedRow,
  );

  const activeVm =
    detailsQuery.vm ??
    (selectedRow ? mapDoctorOrderToDetail(selectedRow.raw) : null);

  useEffect(() => {
    setPage(1);
  }, [tab, search, limit]);

  useEffect(() => {
    if (page > list.totalPages) {
      setPage(list.totalPages);
    }
  }, [list.totalPages, page]);

  const openDetails = (row: MedicalRequestRowVm) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  const openLab = (row: MedicalRequestRowVm) => {
    setSelectedRow(row);
    setLabOpen(true);
  };

  const openRadiology = (row: MedicalRequestRowVm) => {
    setSelectedRow(row);
    setRadiologyOpen(true);
  };

  const handleReorder = () => {
    if (!activeVm?.raw) return;
    const path = resolveMedicalRequestReorderPath(activeVm.raw);
    if (!path) {
      toast(
        tr(
          'تعذّر تحديد مسار إعادة الطلب لهذا المريض.',
          'Could not resolve reorder path for this patient.',
        ),
        { variant: 'error' },
      );
      return;
    }
    setDetailsOpen(false);
    navigate(path);
  };

  const handleStatusUpdate = async (statusCode: string) => {
    if (!activeVm?.id) return;
    try {
      await orderMutations.updateStatus({
        orderId: activeVm.id,
        statusCode,
      });
      toast(tr('تم تحديث حالة الطلب.', 'Request status updated.'), {
        variant: 'success',
      });
      setStatusOpen(false);
      await detailsQuery.refetch();
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  const handleUploadResult = async (input: {
    reportText: string;
    isFinal: boolean;
  }) => {
    if (!activeVm?.id) return;
    try {
      await orderMutations.appendResults({
        orderId: activeVm.id,
        body: {
          reportText: input.reportText,
          summary: input.reportText,
          isFinal: input.isFinal,
        },
      });
      toast(tr('تمت إضافة النتيجة.', 'Result added.'), { variant: 'success' });
      setUploadResultOpen(false);
      await detailsQuery.refetch();
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {tr('الطلبات الطبية • LMJ Health', 'Medical Requests • LMJ Health')}
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <MedicalRequestsPageHeader />

        <div className="mb-6">
          <MedicalRequestsStatCards
            stats={{
              all: stats.all,
              lab: stats.lab,
              radiology: stats.radiology,
              procedure: stats.procedure,
              referral: stats.referral,
            }}
          />
        </div>

        {list.isDemo ? (
          <p className="mb-4 rounded-[10px] border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-2 text-right font-cairo text-[12px] font-semibold text-[#92400E]">
            {tr(
              'وضع الواجهة فقط (VITE_UI_ONLY) مفعّل — بيانات تجريبية محلية.',
              'UI-only mode (VITE_UI_ONLY) is enabled — local demo data.',
            )}
          </p>
        ) : null}

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
          <MedicalRequestsToolbar
            search={search}
            onSearchChange={setSearch}
            tab={tab}
            onTabChange={setTab}
          />

          <div className="mt-6">
            {list.isAwaitingData && !list.rows.length ? (
              <div className="space-y-4">
                <DoctorToolbarSkeleton tabs={3} />
                <DoctorTableSkeleton rows={8} columns={6} />
              </div>
            ) : list.isError ? (
              <DoctorListErrorState
                title={tr(
                  'تعذّر تحميل الطلبات الطبية',
                  'Failed to load medical requests',
                )}
                brief={getUserFacingRequestErrorMessage(list.error)}
                retrying={retryingList}
                onRetry={() => void retryList()}
              />
            ) : (
              <MedicalRequestsTable
                rows={list.rows}
                onOpenDetails={openDetails}
                onOpenLabResult={openLab}
                onOpenRadiologyViewer={openRadiology}
              />
            )}
          </div>
        </section>

        {!list.isAwaitingData && !list.isError ? (
          <div className="mt-5">
            <MedicalRequestsPagination
              page={list.page}
              totalPages={list.totalPages}
              showingFrom={list.showingFrom}
              showingTo={list.showingTo}
              total={list.total}
              pageSize={limit}
              disabled={false}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        ) : null}

        <MedicalRequestDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          vm={activeVm}
          onViewLabResult={() => {
            setDetailsOpen(false);
            setLabOpen(true);
          }}
          onViewRadiology={() => {
            setDetailsOpen(false);
            setRadiologyOpen(true);
          }}
          onReorder={handleReorder}
          onUpdateStatus={() => setStatusOpen(true)}
          onUploadResult={() => setUploadResultOpen(true)}
        />

        <MedicalRequestUploadResultDialog
          open={uploadResultOpen}
          onClose={() => setUploadResultOpen(false)}
          patientName={activeVm?.patientName ?? '—'}
          busy={orderMutations.isAppendingResults}
          onConfirm={handleUploadResult}
        />

        <MedicalRequestUpdateStatusDialog
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          currentStatusCode={activeVm?.statusCode ?? ''}
          currentStatusLabel={activeVm?.statusLabel ?? '—'}
          patientName={activeVm?.patientName ?? '—'}
          busy={orderMutations.isUpdatingStatus}
          onConfirm={handleStatusUpdate}
        />

        <LabResultDialog
          open={labOpen}
          onClose={() => setLabOpen(false)}
          vm={activeVm}
        />

        <RadiologyViewerDialog
          open={radiologyOpen}
          onClose={() => setRadiologyOpen(false)}
          vm={activeVm}
        />

        {(detailsOpen || labOpen || radiologyOpen || statusOpen || uploadResultOpen) &&
        detailsQuery.isAwaitingData ? (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 font-cairo text-[12px] font-bold text-white shadow-lg">
            جارٍ تحميل التفاصيل...
          </div>
        ) : null}
      </div>
    </>
  );
}
