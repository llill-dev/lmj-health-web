import type { PrescriptionMedicationItem } from './prescription-types';
import { PrescriptionMedicationCard } from './prescription-medication-card';
import { useI18n } from '@/i18n/provider';

export function PrescriptionSelectedMedications({
  items,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  items: PrescriptionMedicationItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#667085]">
        {t('doctor.selectedMedications.title').replace(
          '{count}',
          String(items.length),
        )}
      </h2>

      {items.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] px-4 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
          {t('doctor.selectedMedications.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <PrescriptionMedicationCard
              key={item.id}
              item={item}
              collapsible
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
              onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
