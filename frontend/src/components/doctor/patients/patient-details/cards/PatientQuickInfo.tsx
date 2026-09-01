'use client';

import { useI18n } from '@/i18n/provider';

type PatientQuickInfoProps = {
  bloodType: string;
  heightLabel?: string;
  weightLabel?: string;
  allergiesCount: number;
  medicalConditionsCount: number;
  relationshipLabel?: string;
};

function QuickInfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">
        {label}
      </div>
      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
        {value}
      </div>
    </div>
  );
}

export function PatientQuickInfo({
  bloodType,
  heightLabel,
  weightLabel,
  allergiesCount,
  medicalConditionsCount,
  relationshipLabel,
}: PatientQuickInfoProps) {
  const { t } = useI18n();
  const itemsCount = (count: number) =>
    t('doctor.patientCard.itemsCount').replace('{count}', String(count));

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <QuickInfoTile
        label={t('doctor.patientCard.bloodType')}
        value={bloodType || t('doctor.patientQuickInfo.unspecified')}
      />
      <QuickInfoTile
        label={t('doctor.patientCard.allergies')}
        value={
          allergiesCount > 0
            ? itemsCount(allergiesCount)
            : t('doctor.patientCard.none')
        }
      />
      <QuickInfoTile
        label={t('doctor.patientCard.chronicConditions')}
        value={
          medicalConditionsCount > 0
            ? itemsCount(medicalConditionsCount)
            : t('doctor.patientCard.none')
        }
      />
      <QuickInfoTile
        label={t('doctor.patientQuickInfo.heightWeight')}
        value={
          heightLabel && heightLabel !== '—' && weightLabel && weightLabel !== '—'
            ? `${heightLabel} · ${weightLabel}`
            : heightLabel && heightLabel !== '—'
              ? heightLabel
              : weightLabel && weightLabel !== '—'
                ? weightLabel
                : relationshipLabel || '—'
        }
      />
    </div>
  );
}
