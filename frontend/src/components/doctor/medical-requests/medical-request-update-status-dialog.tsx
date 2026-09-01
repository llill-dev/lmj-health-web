'use client';

import { useEffect, useMemo, useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import { buildDoctorOrderStatusUpdateOptions } from '@/lib/doctor/orders/orderStatusLabels';
import { MedicalRequestModalShell } from './medical-request-modal-shell';
import { useI18n } from '@/i18n/provider';

export function MedicalRequestUpdateStatusDialog({
  open,
  onClose,
  currentStatusCode,
  currentStatusLabel,
  patientName,
  busy,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  currentStatusCode: string;
  currentStatusLabel: string;
  patientName: string;
  busy?: boolean;
  onConfirm: (statusCode: string) => Promise<void>;
}) {
  const { dir, locale, t } = useI18n();
  const options = useMemo(
    () => buildDoctorOrderStatusUpdateOptions(currentStatusCode, locale),
    [currentStatusCode, locale],
  );
  const [nextStatus, setNextStatus] = useState(options[0]?.value ?? '');

  useEffect(() => {
    if (open) {
      setNextStatus(options[0]?.value ?? '');
    }
  }, [open, options]);

  return (
    <MedicalRequestModalShell
      open={open}
      onClose={onClose}
      title={t('doctor.medicalRequestUpdateStatus.title')}
      maxWidthClass="max-w-[480px]"
    >
      <div className="space-y-5 text-start" dir={dir}>
        <p className="font-cairo text-[13px] font-semibold leading-6 text-[#667085]">
          {t('doctor.medicalRequestUpdateStatus.subtitle')}{' '}
          <span className="font-extrabold text-[#111827]">{patientName}</span>
        </p>

        <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3">
          <span className="block font-cairo text-[11px] font-bold text-[#667085]">
            {t('doctor.medicalRequestUpdateStatus.currentStatus')}
          </span>
          <span className="mt-1 block font-cairo text-[14px] font-extrabold text-[#111827]">
            {currentStatusLabel}
          </span>
        </div>

        <div>
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            {t('doctor.medicalRequestUpdateStatus.newStatus')}
          </span>
          {options.length ? (
            <StyledSelect
              size="sm"
              tone="muted"
              value={nextStatus}
              onChange={setNextStatus}
              disabled={busy}
              options={options}
              placeholder={t('doctor.medicalRequestUpdateStatus.selectNewStatus')}
              listboxAriaLabel={t('doctor.medicalRequestUpdateStatus.newStatus')}
              listboxZIndex={200}
              emptyState={t('doctor.medicalRequestUpdateStatus.noStatusesAvailable')}
            />
          ) : (
            <p className="rounded-[8px] border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-semibold leading-6 text-[#92400E]">
              {t('doctor.medicalRequestUpdateStatus.terminalStateHint')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white font-cairo text-[13px] font-extrabold text-[#475467]"
          >
            {t('doctor.medicalRequestUpdateStatus.cancel')}
          </button>
          <button
            type="button"
            disabled={busy || !nextStatus}
            onClick={() => void onConfirm(nextStatus)}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(15,143,139,0.28)] disabled:opacity-60"
          >
            {busy ? t('doctor.medicalRequestUpdateStatus.saving') : t('doctor.medicalRequestUpdateStatus.confirm')}
          </button>
        </div>
      </div>
    </MedicalRequestModalShell>
  );
}
