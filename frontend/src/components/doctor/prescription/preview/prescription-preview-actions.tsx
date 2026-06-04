import { ArrowLeft, Check, FileDown } from 'lucide-react';

export function PrescriptionPreviewActions({
  onFinalize,
  onEdit,
  onCreatePdf,
  busy,
  finalizeDisabled,
}: {
  onFinalize: () => void;
  onEdit: () => void;
  onCreatePdf: () => void;
  busy?: boolean;
  finalizeDisabled?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={onFinalize}
        disabled={busy || finalizeDisabled}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Check className="h-5 w-5" aria-hidden />
        اعتماد نهائي
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        تعديل الوصفة
      </button>
      <button
        type="button"
        onClick={onCreatePdf}
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#D8F0EE] disabled:opacity-60"
      >
        <FileDown className="h-5 w-5" aria-hidden />
        إنشاء PDF
      </button>
    </div>
  );
}
