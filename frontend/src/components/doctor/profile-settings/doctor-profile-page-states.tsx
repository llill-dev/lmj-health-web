'use client';

import { DoctorProfileFormSkeleton } from '@/components/doctor/shared/skeletons';

export function DoctorProfilePageLoading() {
  return <DoctorProfileFormSkeleton fields={8} />;
}

export function DoctorProfilePageError() {
  return (
    <div className="rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
      تعذّر تحميل الملف الشخصي. حاول تحديث الصفحة.
    </div>
  );
}
