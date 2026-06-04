import type { PrescriptionPreviewMedicationVm } from "./prescription-preview-types";

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-center text-right">
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
  return (
    <article className="relative rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4">
      <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary font-cairo text-[12px] font-extrabold text-white">
        {item.index}
      </span>

      <h3 className="mb-4 pe-8 text-right font-cairo text-[16px] font-extrabold text-[#101828]">
        {item.name}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <MetaCell label="التركيز" value={item.concentration} />
          <MetaCell label="طريقة الاستخدام" value={item.usage} />
          {item.instructions ? (
            <MetaCell label="التعليمات" value={item.instructions} />
          ) : null}
        </div>
        <div className="space-y-3">
          <MetaCell label="التكرار" value={item.frequency} />
          <MetaCell label="المدة" value={item.duration} />
        </div>
      </div>
    </article>
  );
}
