import { ChevronDown, Plus } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function PrescriptionAddMedicationButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mb-5 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus className="h-5 w-5" aria-hidden />
      <span>{t('doctor.prescriptionActions.addMedication')}</span>
      <ChevronDown className="h-4 w-4 opacity-90" aria-hidden />
    </button>
  );
}
