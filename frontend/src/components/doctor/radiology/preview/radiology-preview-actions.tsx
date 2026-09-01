import { ArrowLeft, Check, FileDown } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function RadiologyPreviewActions({
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
  const { t } = useI18n();
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={onFinalize}
        disabled={busy || finalizeDisabled}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
      >
        <Check className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyPreviewActions.finalize')}
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyPreviewActions.editOrder')}
      </button>
      <button
        type="button"
        onClick={onCreatePdf}
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border-2 border-primary bg-[#E6F4F3] font-cairo text-[14px] font-extrabold text-primary"
      >
        <FileDown className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyPreviewActions.createPdf')}
      </button>
    </div>
  );
}
