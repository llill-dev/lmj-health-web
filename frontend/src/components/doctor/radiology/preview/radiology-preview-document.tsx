import { ScanLine } from 'lucide-react';
import { RadiologySelectedItemCard } from '../radiology-selected-item-card';
import type { RadiologyPreviewVm } from './radiology-preview-types';

function ClinicalRow({ label, value }: { label: string; value: string }) {
  if (!value?.trim() || value === '—') return null;
  return (
    <div className="text-right">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">{label}:</div>
      <div className="mt-0.5 font-cairo text-[13px] font-extrabold text-[#101828]">{value}</div>
    </div>
  );
}

export function RadiologyPreviewDocument({ vm }: { vm: RadiologyPreviewVm }) {
  return (
    <article className="rounded-[16px] border border-[#E4E7EC] bg-white px-5 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#EEF2F6] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-left">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">رقم الطلب</div>
          <div className="mt-1 font-cairo text-[18px] font-black text-[#101828]">
            {vm.orderCode}
          </div>
        </div>
        <div className="text-right">
          <div className="font-cairo text-[18px] font-extrabold text-[#101828]">
            {vm.patientName}
          </div>
          <div className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
            {vm.patientMeta}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ClinicalRow label="درجة الاستعجال" value={vm.clinical.urgency} />
        <ClinicalRow label="السبب الطبي" value={vm.clinical.clinicalReason} />
        <ClinicalRow
          label="تعليمات المريض"
          value={vm.clinical.instructionsToPatient}
        />
        <ClinicalRow
          label="تعليمات المركز"
          value={vm.clinical.imagingCenterInstructions}
        />
      </div>

      <div className="mb-4 flex items-center justify-end gap-2">
        <h2 className="font-cairo text-[16px] font-extrabold text-[#101828]">
          الأشعة المختارة:
        </h2>
        <ScanLine className="h-5 w-5 text-primary" aria-hidden />
      </div>

      {vm.items.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
          لا توجد فحوصات في هذا الطلب.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {vm.items.map((item) => (
            <RadiologySelectedItemCard key={item.id} item={item} readOnly />
          ))}
        </div>
      )}
    </article>
  );
}
