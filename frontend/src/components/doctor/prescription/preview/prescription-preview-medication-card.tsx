import type { PrescriptionPreviewMedicationVm } from "./prescription-preview-types";
import { useI18n } from "@/i18n/provider";

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-center text-start">
      <div className="font-cairo text-[12px] font-extrabold text-[#101828]">
        {label}:
      </div>
      <div className="font-cairo text-[12px] font-bold text-[#667085]">
        {value}
      </div>
    </div>
  );
}

export function PrescriptionPreviewMedicationCard({
  item,
}: {
  item: PrescriptionPreviewMedicationVm;
}) {
  const { t } = useI18n();
  return (
    <article className="relative rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4">
      <span className="absolute top-3 start-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary font-cairo text-[12px] font-extrabold text-white">
        {item.index}
      </span>

      <h3 className="mb-4 pe-8 text-start font-cairo text-[16px] font-extrabold text-[#101828]">
        {item.name}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <MetaCell
            label={t('doctor.prescriptionPreviewMedication.concentration')}
            value={item.concentration}
          />
          <MetaCell
            label={t('doctor.prescriptionPreviewMedication.usage')}
            value={item.usage}
          />
          {item.instructions ? (
            <MetaCell
              label={t('doctor.prescriptionPreviewMedication.instructions')}
              value={item.instructions}
            />
          ) : null}
        </div>
        <div className="space-y-3">
          <MetaCell label={t('doctor.medicationCard.frequencyLabel')} value={item.frequency} />
          <MetaCell label={t('doctor.medicationCard.durationLabel')} value={item.duration} />
        </div>
      </div>
    </article>
  );
}
