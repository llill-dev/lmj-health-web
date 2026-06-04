import { Check, Download } from 'lucide-react';

export function EncounterSummaryActions({
  onExportPdf,
  onFinish,
  finishing,
  exportingPdf,
}: {
  onExportPdf: () => void;
  onFinish: () => void;
  finishing?: boolean;
  exportingPdf?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={onExportPdf}
        disabled={exportingPdf}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-5 w-5" aria-hidden />
        {exportingPdf ? 'جارٍ إنشاء PDF...' : 'تصدير PDF'}
      </button>
      <button
        type="button"
        onClick={onFinish}
        disabled={finishing}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Check className="h-5 w-5" aria-hidden />
        {finishing ? 'جارٍ الحفظ...' : 'إنهاء وحفظ الزيارة الطبية'}
      </button>
    </div>
  );
}
