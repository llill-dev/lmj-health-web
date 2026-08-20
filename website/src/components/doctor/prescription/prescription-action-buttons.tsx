import { Check, Eye, Save } from 'lucide-react';

export function PrescriptionActionButtons({
  onSaveDraft,
  onPreview,
  onFinalize,
  saving,
  disabled,
}: {
  onSaveDraft: () => void;
  onPreview: () => void;
  onFinalize: () => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-5 w-5" aria-hidden />
        حفظ المسودة
      </button>
      <button
        type="button"
        onClick={onPreview}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
      >
        <Eye className="h-5 w-5" aria-hidden />
        معاينة
      </button>
      <button
        type="button"
        onClick={onFinalize}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
      >
        <Check className="h-5 w-5" aria-hidden />
        اعتماد نهائي
      </button>
    </div>
  );
}
