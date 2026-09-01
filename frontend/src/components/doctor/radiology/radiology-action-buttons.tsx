import { Check, Eye, Save } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function RadiologyActionButtons({
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
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] disabled:opacity-60"
      >
        <Save className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyActions.saveDraft')}
      </button>
      <button
        type="button"
        onClick={onPreview}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] disabled:opacity-60"
      >
        <Eye className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyActions.preview')}
      </button>
      <button
        type="button"
        onClick={onFinalize}
        disabled={saving || disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] disabled:opacity-60"
      >
        <Check className="h-5 w-5" aria-hidden />
        {t('doctor.radiologyActions.finalize')}
      </button>
    </div>
  );
}
