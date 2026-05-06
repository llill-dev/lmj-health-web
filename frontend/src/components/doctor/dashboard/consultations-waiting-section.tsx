'use client';

import {
  CalendarDays,
  Clock3,
  ReceiptText,
  Smartphone,
  UserRound,
} from 'lucide-react';

import DashboardSectionHeading from '@/components/doctor/dashboard/dashboard-section-heading';

export default function ConsultationsWaitingSection() {
  return (
    <section>
      <DashboardSectionHeading
        title='قائمة الانتظار'
        actionLabel='عرض الكل'
        className='mb-[22px]'
      />

      <article className='w-full h-[160px] rounded-[8px] border border-[#18C3C0] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.22)]'>
            <UserRound className='h-6 w-6' />
          </div>

          <div className='flex-1 text-right'>
            <h3 className='font-cairo text-[18px] font-black leading-none text-[#243044]'>
              فاطمة أحمد السالم
            </h3>

            <div className='mt-2 space-y-1 font-cairo text-[14px] leading-6 text-[#243044]'>
              <div className='flex items-center justify-start gap-2'>
                <span>
                  <span className='font-black text-primary'>التاريخ المتاح : </span>
                  18 ديسمبر - 28 ديسمبر
                </span>
                <CalendarDays className='h-4 w-4 text-primary' />
              </div>

              <div className='flex items-center justify-start gap-2'>
                <span>
                  <span className='font-black text-primary'>وسيلة التواصل : </span>
                  واتساب - اتصال
                </span>
                <Smartphone className='h-4 w-4 text-primary' />
              </div>

              <div className='flex items-center justify-start gap-2'>
                <span>
                  <span className='font-black text-primary'>الوقت المتاح : </span>
                  11:30 صباحاً الى 2:00 ظهراً
                </span>
                <Clock3 className='h-4 w-4 text-primary' />
              </div>

              <div className='flex items-center justify-start gap-2'>
                <span>
                  <span className='font-black text-primary'>درجة استعجال الحالة : </span>
                  متوسط
                </span>
                <ReceiptText className='h-4 w-4 text-primary' />
              </div>
            </div>
          </div>

<div className='flex flex-col gap-12 justify-between items-end '>
           <span className='inline-flex min-w-[82px] items-center justify-center rounded-[6px] border border-[#14B8B4] px-4 py-1 font-cairo text-[13px] font-black text-primary'>
            انتظار
          </span>
          <div className='mt-3 flex justify-end'>
          <button
            type='button'
            className='rounded-[6px] bg-primary px-8 py-2.5 font-cairo text-[14px] font-black text-white shadow-[0_8px_18px_rgba(15,143,139,0.20)]'
          >
            التفاصيل
          </button>
        </div>
</div>
        </div>
      </article>
    </section>
  );
}
