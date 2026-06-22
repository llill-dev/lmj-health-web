'use client';

import { ClipboardList, Download, Eye, FileText } from 'lucide-react';
import type { MedicalRequestDetailVm } from './map-doctor-medical-requests';
import { MedicalRequestInfoCard } from './medical-request-info-card';
import { MedicalRequestModalShell } from './medical-request-modal-shell';
import { useMedicalRequestDocument } from './use-medical-request-document';

export function MedicalRequestDetailsDialog({
  open,
  onClose,
  vm,
  onViewLabResult,
  onViewRadiology,
  onReorder,
  onUpdateStatus,
  onUploadResult,
}: {
  open: boolean;
  onClose: () => void;
  vm: MedicalRequestDetailVm | null;
  onViewLabResult: () => void;
  onViewRadiology: () => void;
  onReorder: () => void;
  onUpdateStatus: () => void;
  onUploadResult: () => void;
}) {
  const { openResultUrl, documentBusy } = useMedicalRequestDocument();

  if (!vm) return null;

  const showResultSection =
    vm.category === 'lab' ||
    vm.category === 'radiology' ||
    vm.category === 'procedure';

  return (
    <MedicalRequestModalShell
      open={open}
      onClose={onClose}
      title="تفاصيل الطلب"
      titleIcon={<FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
    >
      <div className="space-y-5">
        <MedicalRequestInfoCard vm={vm} />

        <section dir="rtl" className="text-start">
          <div className="mb-2 flex items-center justify-start gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
            <ClipboardList className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>ملاحظات إضافية</span>
          </div>
          <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3 text-start font-cairo text-[13px] font-semibold leading-6 text-[#344054]">
            {vm.additionalNotes}
          </div>
        </section>

        {showResultSection ? (
          <section dir="rtl" className="text-start">
            <div className="mb-3 flex items-center justify-start gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <ClipboardList className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>النتيجة</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={documentBusy}
                onClick={() => {
                  if (vm.category === 'lab') {
                    onViewLabResult();
                    return;
                  }
                  if (vm.category === 'radiology') {
                    onViewRadiology();
                    return;
                  }
                  void openResultUrl(vm, 'view');
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border-2 border-primary bg-white font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA] disabled:opacity-60"
              >
                <Eye className="h-4 w-4" aria-hidden />
                عرض
              </button>
              <button
                type="button"
                disabled={documentBusy}
                onClick={() => void openResultUrl(vm, 'download')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border-2 border-primary bg-white font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA] disabled:opacity-60"
              >
                <Download className="h-4 w-4" aria-hidden />
                تحميل
              </button>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={onUploadResult}
            disabled={!vm.canUploadResults}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border-2 border-primary bg-white font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            إضافة نتيجة
          </button>
          <button
            type="button"
            onClick={onUpdateStatus}
            disabled={!vm.canUpdateStatus}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            تحديث الحالة
          </button>
          <button
            type="button"
            onClick={onReorder}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(15,143,139,0.28)] transition hover:opacity-95 sm:col-span-2"
          >
            إعادة الطلب
          </button>
        </div>
      </div>
    </MedicalRequestModalShell>
  );
}
