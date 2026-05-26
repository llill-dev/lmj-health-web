'use client';

import type { LucideIcon } from 'lucide-react';

export type DoctorProfileFieldRow = {
  label: string;
  value: string;
};

export default function DoctorProfileSectionCard({
  title,
  icon: Icon,
  fields,
}: {
  title: string;
  icon: LucideIcon;
  fields: DoctorProfileFieldRow[];
}) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[#EEF2F6] bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
            {title}
          </h2>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="text-right">
            <div className="font-cairo text-[11px] font-bold text-[#667085]">
              {field.label}
            </div>
            <div className="mt-1.5 rounded-[10px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-3 font-cairo text-[13px] font-extrabold text-[#101828]">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
