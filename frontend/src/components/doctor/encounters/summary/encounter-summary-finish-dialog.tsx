'use client';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import type { EncounterSummaryViewModel } from './encounter-summary-types';

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
  const isClosed = encounterStatus === 'closed';
  const statusLabel = isClosed ? 'مغلقة' : 'مفتوحة';

  const description = (
    <div className="space-y-4 text-start font-cairo">
      <p className="text-[14px] font-semibold leading-[22px] text-[#344054]">
        راجعت ملخص الزيارة. بالتأكيد ستُنهى المراجعة وتعود إلى قائمة
        الزيارات الطبية.
      </p>

      <div className="space-y-3 rounded-[10px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4">
        <div className="font-cairo text-[14px] font-extrabold text-primary">
          بيانات الزيارة
        </div>
        <SummaryStatRow label="المريض" value={summary.patient.name} />
        <SummaryStatRow label="رقم الملف" value={summary.patient.fileNumber} />
        <SummaryStatRow label="العمر" value={summary.patient.ageLabel} />
        <SummaryStatRow label="حالة الزيارة" value={statusLabel} />
        {summary.closedAtLabel ? (
          <SummaryStatRow label="تاريخ الإغلاق" value={summary.closedAtLabel} />
        ) : null}
      </div>

      <div className="space-y-2 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-4">
        <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
          ملخص التوثيق السريري
        </div>
        <SummaryStatRow
          label="التشخيصات"
          value={summary.diagnoses.length}
        />
        <SummaryStatRow
          label="الأدوية"
          value={summary.medications.length}
        />
        <SummaryStatRow label="التحاليل" value={summary.labs.length} />
        <SummaryStatRow label="الأشعة" value={summary.radiology.length} />
        <SummaryStatRow
          label="التحويلات"
          value={summary.referrals.length}
        />
      </div>

      {!isClosed ? (
        <p className="rounded-[8px] border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-[12px] font-semibold text-[#B45309]">
          تنبيه: الزيارة ما زالت مفتوحة. يُفضَّل إغلاقها من مساحة العمل قبل
          اعتماد الملخص النهائي.
        </p>
      ) : null}

      {summary.diagnoses.length === 0 &&
      summary.medications.length === 0 &&
      summary.labs.length === 0 &&
      summary.radiology.length === 0 &&
      summary.referrals.length === 0 ? (
        <p className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[12px] font-semibold text-[#1D4ED8]">
          الملخص لا يحتوي على وصفات أو طلبات مسجّلة بعد. يمكنك العودة لاحقاً
          لإكمال التوثيق.
        </p>
      ) : null}
    </div>
  );

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إنهاء وحفظ الزيارة الطبية"
      description={description}
      confirmLabel="تأكيد الإنهاء والحفظ"
      confirmDisabled={confirmDisabled}
      onConfirm={onConfirm}
    />
  );
}
