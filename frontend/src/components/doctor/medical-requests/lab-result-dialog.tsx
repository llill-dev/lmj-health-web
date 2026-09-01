'use client';

import { Download } from 'lucide-react';
import type { MedicalRequestDetailVm } from './map-doctor-medical-requests';
import { MedicalRequestInfoCard } from './medical-request-info-card';
import { MedicalRequestModalShell } from './medical-request-modal-shell';
import { useMedicalRequestDocument } from './use-medical-request-document';
import { useI18n } from '@/i18n/provider';

export function LabResultDialog({
  open,
  onClose,
  vm,
}: {
  open: boolean;
  onClose: () => void;
  vm: MedicalRequestDetailVm | null;
}) {
  const { openResultUrl, documentBusy } = useMedicalRequestDocument();
  const { t } = useI18n();

  if (!vm) return null;

  return (
    <MedicalRequestModalShell
      open={open}
      onClose={onClose}
      title={t('doctor.medicalRequests.table.menuLabResult')}
      maxWidthClass="max-w-[640px]"
    >
      <div className="space-y-5">
        <MedicalRequestInfoCard
          vm={vm}
          subtitle={
            <>
              <span className="font-extrabold text-[#344054]">
                {t('doctor.medicalRequests.dialog.typeLabel')}
              </span>{' '}
              {vm.typeDetail}
            </>
          }
        />

        <div className="min-h-[280px] rounded-[8px] border border-dashed border-[#E2E8F0] bg-[#FAFAFA]" />

        <button
          type="button"
          disabled={documentBusy}
          onClick={() => void openResultUrl(vm, 'download')}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {documentBusy
            ? t('doctor.medicalRequests.dialog.downloading')
            : t('doctor.medicalRequests.dialog.download')}
        </button>
      </div>
    </MedicalRequestModalShell>
  );
}
