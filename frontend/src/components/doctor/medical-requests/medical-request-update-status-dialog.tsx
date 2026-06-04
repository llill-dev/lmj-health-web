'use client';

import { useEffect, useMemo, useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import { buildDoctorOrderStatusUpdateOptions } from '@/lib/doctor/orderStatusLabels';
import { MedicalRequestModalShell } from './medical-request-modal-shell';

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
  const options = useMemo(
    () => buildDoctorOrderStatusUpdateOptions(currentStatusCode),
    [currentStatusCode],
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
      title="تحديث الحالة"
      maxWidthClass="max-w-[480px]"
    >
      <div className="space-y-5 text-right" dir="rtl">
        <p className="font-cairo text-[13px] font-semibold leading-6 text-[#667085]">
          تحديث حالة طلب المريض{' '}
          <span className="font-extrabold text-[#111827]">{patientName}</span>
        </p>

        <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3">
          <span className="block font-cairo text-[11px] font-bold text-[#667085]">
            الحالة الحالية
          </span>
          <span className="mt-1 block font-cairo text-[14px] font-extrabold text-[#111827]">
            {currentStatusLabel}
          </span>
        </div>

        <div>
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            الحالة الجديدة
          </span>
          {options.length ? (
            <StyledSelect
              size="sm"
              tone="muted"
              value={nextStatus}
              onChange={setNextStatus}
              disabled={busy}
              options={options}
              placeholder="اختر الحالة الجديدة"
              listboxAriaLabel="الحالة الجديدة"
              listboxZIndex={200}
              emptyState="لا توجد حالات متاحة"
            />
          ) : (
            <p className="rounded-[8px] border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 font-cairo text-[12px] font-semibold leading-6 text-[#92400E]">
              لا يمكن تغيير حالة هذا الطلب لأنه في حالة نهائية (مكتمل، معتمد، ملغى، أو
              مرفوض).
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white font-cairo text-[13px] font-extrabold text-[#475467]"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={busy || !nextStatus}
            onClick={() => void onConfirm(nextStatus)}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(15,143,139,0.28)] disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ...' : 'تأكيد'}
          </button>
        </div>
      </div>
    </MedicalRequestModalShell>
  );
}
