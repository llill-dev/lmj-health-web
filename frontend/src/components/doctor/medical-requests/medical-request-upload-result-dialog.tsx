'use client';

import { useEffect, useState } from 'react';
import { MedicalRequestModalShell } from './medical-request-modal-shell';

export function MedicalRequestUploadResultDialog({
  open,
  onClose,
  patientName,
  busy,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  patientName: string;
  busy?: boolean;
  onConfirm: (input: {
    reportText: string;
    isFinal: boolean;
  }) => Promise<void>;
}) {
  const [reportText, setReportText] = useState('');
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (open) {
      setReportText('');
      setIsFinal(false);
    }
  }, [open]);

  return (
    <MedicalRequestModalShell
      open={open}
      onClose={onClose}
      title="إضافة نتيجة"
      maxWidthClass="max-w-[520px]"
    >
      <div className="space-y-5 text-right" dir="rtl">
        <p className="font-cairo text-[13px] font-semibold text-[#667085]">
          إضافة نتيجة لطلب المريض{' '}
          <span className="font-extrabold text-[#111827]">{patientName}</span>
        </p>

        <label className="block">
          <span className="mb-2 block font-cairo text-[12px] font-extrabold text-[#344054]">
            نص النتيجة
          </span>
          <textarea
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            rows={6}
            placeholder="اكتب ملخص النتيجة أو الملاحظات السريرية..."
            className="w-full rounded-[8px] border border-[#E5E7EB] px-3 py-2 font-cairo text-[13px]"
          />
        </label>

        <label className="flex items-center gap-2 font-cairo text-[13px] font-semibold text-[#344054]">
          <input
            type="checkbox"
            checked={isFinal}
            onChange={(event) => setIsFinal(event.target.checked)}
          />
          اعتبار النتيجة نهائية وإكمال الطلب
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            disabled={busy || !reportText.trim()}
            onClick={() =>
              void onConfirm({
                reportText: reportText.trim(),
                isFinal,
              })
            }
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ...' : 'حفظ النتيجة'}
          </button>
        </div>
      </div>
    </MedicalRequestModalShell>
  );
}
