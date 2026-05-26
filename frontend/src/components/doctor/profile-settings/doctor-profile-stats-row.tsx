'use client';

import type { ReactNode } from 'react';

export type DoctorProfileStatItem = {
  key: string;
  value: ReactNode;
  label: ReactNode;
};

export default function DoctorProfileStatsRow({
  items,
}: {
  items: DoctorProfileStatItem[];
}) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-[6px] border-[1.82px] border-[#9EE8E0] bg-white px-6 py-5 text-center shadow-[0px_4px_12px_-2px_rgba(15,143,139,0.12)]"
        >
          <div className="font-cairo text-[28px] font-black leading-[34px] text-primary">
            {item.value}
          </div>
          <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
            {item.label}
          </p>
        </div>
      ))}
    </section>
  );
}
