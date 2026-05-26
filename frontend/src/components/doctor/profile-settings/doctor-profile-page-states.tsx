'use client';

import { Loader2 } from 'lucide-react';

export function DoctorProfilePageLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center font-cairo text-[13px] font-semibold text-[#667085]">
      <Loader2 className="me-2 h-5 w-5 animate-spin text-primary" />
      جاري تحميل الملف الشخصي…
    </div>
  );
}

export function DoctorProfilePageError() {
  return (
    <div className="rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
      تعذّر تحميل الملف الشخصي. حاول تحديث الصفحة.
    </div>
  );
}
