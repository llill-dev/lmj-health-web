'use client';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import type { EncounterSummaryViewModel } from './encounter-summary-types';
import { useI18n } from '@/i18n/provider';

function SummaryStatRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 font-cairo text-[13px]">
      <span className="font-extrabold text-[#101828]">{value}</span>
      <span className="font-semibold text-[#667085]">{label}</span>
    </div>
  );
}

export default function EncounterSummaryFinishDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled,
  summary,
  encounterStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
  summary: EncounterSummaryViewModel;
  encounterStatus?: string;
}) {
  const { t } = useI18n();
  const isClosed = encounterStatus === 'closed';
  const statusLabel = isClosed
    ? t('doctor.encounterSummaryFinishDialog.statusClosed')
    : t('doctor.encounterSummaryFinishDialog.statusOpen');

  const description = (
    <div className="space-y-4 text-start font-cairo">
      <p className="text-[14px] font-semibold leading-[22px] text-[#344054]">
        {t('doctor.encounterSummaryFinishDialog.description')}
      </p>

      <div className="space-y-3 rounded-[10px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4">
        <div className="font-cairo text-[14px] font-extrabold text-primary">
          {t('doctor.encounterSummaryFinishDialog.visitDataTitle')}
        </div>
        <SummaryStatRow label={t('doctor.encounterSummaryFinishDialog.patient')} value={summary.patient.name} />
        <SummaryStatRow label={t('doctor.encounterCard.fields.fileNumber')} value={summary.patient.fileNumber} />
        <SummaryStatRow label={t('doctor.encounterCard.fields.age')} value={summary.patient.ageLabel} />
        <SummaryStatRow label={t('doctor.encounterSummaryFinishDialog.visitStatus')} value={statusLabel} />
        {summary.closedAtLabel ? (
          <SummaryStatRow label={t('doctor.encounterSummaryFinishDialog.closedAt')} value={summary.closedAtLabel} />
        ) : null}
      </div>

      <div className="space-y-2 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-4">
        <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
          {t('doctor.encounterSummaryFinishDialog.clinicalDocSummary')}
        </div>
        <SummaryStatRow
          label={t('doctor.addAccessRequestForm.dataType.diagnoses.label')}
          value={summary.diagnoses.length}
        />
        <SummaryStatRow
          label={t('doctor.addAccessRequestForm.dataType.medications.label')}
          value={summary.medications.length}
        />
        <SummaryStatRow label={t('doctor.encounterSummaryFinishDialog.labs')} value={summary.labs.length} />
        <SummaryStatRow label={t('doctor.encounterSummaryFinishDialog.radiology')} value={summary.radiology.length} />
        <SummaryStatRow
          label={t('doctor.encounterSummaryFinishDialog.referrals')}
          value={summary.referrals.length}
        />
      </div>

      {!isClosed ? (
        <p className="rounded-[8px] border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-[12px] font-semibold text-[#B45309]">
          {t('doctor.encounterSummaryFinishDialog.openWarning')}
        </p>
      ) : null}

      {summary.diagnoses.length === 0 &&
      summary.medications.length === 0 &&
      summary.labs.length === 0 &&
      summary.radiology.length === 0 &&
      summary.referrals.length === 0 ? (
        <p className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[12px] font-semibold text-[#1D4ED8]">
          {t('doctor.encounterSummaryFinishDialog.emptyNotice')}
        </p>
      ) : null}
    </div>
  );

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('doctor.encounterSummaryFinishDialog.title')}
      description={description}
      confirmLabel={t('doctor.encounterSummaryFinishDialog.confirmLabel')}
      confirmDisabled={confirmDisabled}
      onConfirm={onConfirm}
    />
  );
}
