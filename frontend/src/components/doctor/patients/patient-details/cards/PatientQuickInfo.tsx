'use client';

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
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <QuickInfoTile label="فصيلة الدم" value={bloodType || 'غير محدد'} />
      <QuickInfoTile
        label="الحساسية"
        value={allergiesCount > 0 ? `${allergiesCount} عنصر` : 'لا توجد'}
      />
      <QuickInfoTile
        label="الأمراض المزمنة"
        value={
          medicalConditionsCount > 0
            ? `${medicalConditionsCount} عنصر`
            : 'لا توجد'
        }
      />
      <QuickInfoTile
        label="الطول / الوزن"
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
