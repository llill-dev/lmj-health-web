import { Calendar } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MedicalRequestDetailVm } from './map-doctor-medical-requests';
import { useI18n } from '@/i18n/provider';

export function MedicalRequestInfoCard({
  vm,
  subtitle,
}: {
  vm: MedicalRequestDetailVm;
  subtitle?: ReactNode;
}) {
  const { dir } = useI18n();
  return (
    <div className="rounded-[8px] bg-[#E6F4F3] px-4 py-4">
      <div dir={dir} className="flex items-start gap-4 text-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-primary font-cairo text-[18px] font-extrabold text-white shadow-[0_4px_12px_rgba(15,143,139,0.28)]">
          {vm.patientInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
            {vm.patientName}
          </div>
          <div className="mt-1 flex items-center justify-start gap-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{vm.dateLabel}</span>
          </div>
          <p className="mt-2 font-cairo text-[12px] font-semibold leading-6 text-[#475467]">
            {subtitle ?? (
              <>
                <span className="font-extrabold text-[#344054]">النوع:</span>{' '}
                {vm.typeDetail}
                <span className="mx-2 text-[#D0D5DD]">|</span>
                <span className="font-extrabold text-[#344054]">الحالة:</span>{' '}
                {vm.statusLabel}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
