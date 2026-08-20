import { Link2, Pill, UserRound } from "lucide-react";
import type { PrescriptionPreviewVm } from "./prescription-preview-types";
import { PrescriptionPreviewMedicationCard } from "./prescription-preview-medication-card";

export function PrescriptionPreviewDocument({
  vm,
}: {
  vm: PrescriptionPreviewVm;
}) {
  return (
    <article className="relative rounded-[16px] border border-[#E4E7EC] bg-white px-5 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-8">
      <div className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary shadow-[0_8px_20px_rgba(15,143,139,0.35)]">
        <Link2 className="w-5 h-5 text-white" aria-hidden />
      </div>

      <div className="mt-2 flex flex-col gap-6 border-b border-[#EEF2F6] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-8 justify-start items-start text-right">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4F3]">
            <UserRound className="w-6 h-6 text-primary" aria-hidden />
          </div>
          <div>
            <div className="font-cairo text-[18px] font-extrabold text-[#101828]">
              {vm.patientName}
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
              {vm.patientMeta}
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
              {vm.patientPhone}
            </div>
            <div className="mt-3 font-cairo text-[14px] font-extrabold text-primary">
              الطبيب {vm.doctorName}
            </div>
          </div>
        </div>
        <div className="text-right sm:min-w-[200px]">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">
            رقم الوصفة
          </div>
          <div className="mt-1 font-cairo text-[18px] font-black text-[#101828]">
            {vm.prescriptionCode}
          </div>
          <span className="mt-2 inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#B45309]">
            {vm.statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-2 justify-start items-center mb-4">
          <Pill className="w-5 h-5 text-primary" aria-hidden />
          <h2 className="font-cairo text-[16px] font-extrabold text-[#101828]">
            الأدوية الموصوفة:
          </h2>
        </div>

        {vm.medications.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#BFEDEC] bg-[#F8FFFE] px-4 py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
            لا توجد أدوية في هذه الوصفة.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {vm.medications.map((item) => (
              <PrescriptionPreviewMedicationCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {vm.generalInstructions ? (
          <div className="mt-6 rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#F8FFFE] px-4 py-4 text-right">
            <div className="font-cairo text-[13px] font-extrabold text-primary">
              التعليمات العامة
            </div>
            <p className="mt-2 font-cairo text-[14px] font-semibold leading-[24px] text-[#344054]">
              {vm.generalInstructions}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
