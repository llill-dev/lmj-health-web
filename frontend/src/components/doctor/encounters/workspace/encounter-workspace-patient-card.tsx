'use client';

import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { EncounterWorkspacePatientViewModel } from './encounter-workspace-types';

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-cairo text-[14px] leading-[26px] text-[#344054]">
      <span className="font-bold text-[#667085]">{label}: </span>
      <span className="ps-6 font-extrabold text-[#101828]">{value}</span>
    </p>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-[10px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 text-center sm:min-w-[120px] sm:flex-none">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">
        {label}
      </div>
      <div className="mt-1 font-cairo text-[14px] font-extrabold text-[#101828]">
        {value}
      </div>
    </div>
  );
}

export function EncounterWorkspacePatientCard({
  patient,
  isEnriching = false,
}: {
  patient: EncounterWorkspacePatientViewModel;
  /** تحميل خلفي لملف المريض (الاسم/العمر قد يتحدّثان) */
  isEnriching?: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-[14px] border border-[#0F8F8B] bg-[#E6F4F3] px-4 py-5 shadow-[0_12px_32px_-14px_rgba(15,23,42,0.1)] sm:px-5">
      <span
        className={cn(
          "absolute start-3 top-3 inline-flex rounded-full px-3 py-1 font-cairo text-[11px] font-extrabold sm:start-4 sm:top-4",
          patient.isActive
            ? "bg-[#DCFCE7] text-[#15803D]"
            : "bg-[#F2F4F7] text-[#667085]",
        )}
      >
        {patient.statusLabel}
      </span>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3 justify-start items-center">
          <div className="flex justify-center items-center h-10 text-primary">
            <UserRound className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <h2 className="font-cairo text-[15px] font-extrabold">
            معلومات المريض
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-1 text-start sm:ms-6">
          <DetailLine label="الاسم" value={patient.name} />
          <DetailLine label="العمر" value={patient.ageLabel} />
          <DetailLine label="رقم الملف" value={patient.fileNumber} />
          {isEnriching ? (
            <p className="font-cairo text-[11px] font-semibold text-primary/75">
              جارٍ تحميل بيانات الملف…
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-stretch justify-start gap-3 sm:items-center">
          <TimeBox label="بدأت" value={patient.startedLabel} />
          <TimeBox label="موعد" value={patient.appointmentTimeLabel} />
        </div>
      </div>
    </article>
  );
}



