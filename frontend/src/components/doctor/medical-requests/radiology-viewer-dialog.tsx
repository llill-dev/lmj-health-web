'use client';

import { ClipboardList, Download, FileText } from 'lucide-react';
import type { MedicalRequestDetailVm } from './map-doctor-medical-requests';
import { MedicalRequestInfoCard } from './medical-request-info-card';
import { MedicalRequestModalShell } from './medical-request-modal-shell';
import { useMedicalRequestDocument } from './use-medical-request-document';

export function RadiologyViewerDialog({
  open,
  onClose,
  vm,
}: {
  open: boolean;
  onClose: () => void;
  vm: MedicalRequestDetailVm | null;
}) {
  const { openResultUrl, documentBusy } = useMedicalRequestDocument();

  if (!vm) return null;

  return (
    <MedicalRequestModalShell
      open={open}
      onClose={onClose}
      title="عارض الأشعة"
      maxWidthClass="max-w-[640px]"
    >
      <div className="space-y-5">
        <MedicalRequestInfoCard
          vm={vm}
          subtitle={
            <>
              <span className="font-extrabold text-[#344054]">صورة:</span>{' '}
              {vm.radiologyImageLabel.replace(/^صورة\s*:\s*/u, '')}
            </>
          }
        />

        <section className="text-right">
          <div className="mb-2 flex items-center justify-end gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
            <span>التقرير</span>
            <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4 font-cairo text-[13px] font-semibold leading-6 text-[#667085]">
            {vm.radiologyReport}
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[#E6F4F3] px-4 py-3">
          <button
            type="button"
            disabled={documentBusy}
            onClick={() => void openResultUrl(vm, 'download')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-primary transition hover:bg-white/70 disabled:opacity-60"
            aria-label="تحميل الملف"
          >
            <Download className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 font-cairo text-[13px] font-bold text-[#111827]">
            <span className="truncate">{vm.radiologyFileName}</span>
            <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          </div>
        </div>

        <button
          type="button"
          disabled={documentBusy}
          onClick={() => void openResultUrl(vm, 'download')}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {documentBusy ? 'جارٍ التحميل...' : 'تحميل'}
        </button>
      </div>
    </MedicalRequestModalShell>
  );
}
