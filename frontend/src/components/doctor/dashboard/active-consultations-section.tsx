'use client';

import { ChevronLeft, UserRound } from 'lucide-react';

import DashboardSectionHeading from '@/components/doctor/dashboard/dashboard-section-heading';

export default function ActiveConsultationsSection() {
  return (
    <section>
      <DashboardSectionHeading
        title='الاستشارات النشطة'
        actionLabel='عرض الكل'
        className='mb-[22px]'
      />

      <article className='w-full h-[160px]  bg-white px-4 py-4 items-center rounded-[10px] border-[0.5px] border-[#078F8D] shadow-[0_8px_18px_rgba(15,23,42,0.04)]'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex-1 flex gap-6'>    <h3 className='min-w-0 truncate text-right font-cairo text-[16px] font-bold leading-[20px] text-[#1F2937]'>
            ألم في الصدر
          </h3>

          <span className='inline-flex  shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4F3] px-[8px] py-[3px] font-cairo text-[12px] font-bold text-primary'>
            نشطة
          </span></div>


          <button
            type='button'
            className='flex h-[36px] w-[36px] shrink-0 items-center justify-center text-primary transition-colors hover:text-[#0A7A77]'
            aria-label='عرض تفاصيل الاستشارة'
          >
            <ChevronLeft className='h-[16px] w-[16px]'  aria-hidden />
          </button>
        </div>

        <div className='mt-10 py-6 flex h-[31px] items-center justify-start gap-4 rounded-[16px] bg-[#E6F4F3] px-6'>
          <UserRound className='h-[16px] w-[16px] shrink-0 text-primary' strokeWidth={2.4} />
          <div className='font-cairo text-[16px] leading-[16px] font-bold text-[#1F2937]'>
            أحمد محمد العلي
          </div>
        </div>
      </article>
    </section>
  );
}
