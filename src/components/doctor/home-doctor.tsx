'use client';

import {
  Calendar,
  Check,
  Clock,
  Users,
  TrendingUp,
  Plus,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useAppointments, useDashboardStats } from '@/hooks';
import { useState } from 'react';

export default function HomeDoctor() {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeStatus, setActiveStatus] = useState('الكل');
  const searchTerm = '';

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    appointments,
    error: appointmentsError,
    refetch,
  } = useAppointments(1, 50, selectedDate, undefined, searchTerm);

  if (statsError || appointmentsError) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-2 text-red-600'>فشل تحميل البيانات</p>
          <button
            onClick={() => refetch()}
            className='mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir='rtl' lang='ar' className='mx-auto w-full max-w-[1120px]'>
      <section className='grid grid-cols-4 gap-4'>
        <div className='border-b-[3.98px] border-[#16C5C0] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد اليوم
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#EFFFFE]'>
              <Calendar className='h-[18px] w-[18px] text-[#16C5C0]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#EFFFFE] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#16C5C0]'>
              +12%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#2563EB] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                إجمالي المرضى
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#EFF6FF]'>
              <Users className='h-[18px] w-[18px] text-[#2563EB]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#EFF6FF] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#2563EB]'>
              +8%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#16A34A] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد مكتملة
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                {statsLoading ? (
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                ) : (
                  stats?.completedAppointments || 0
                )}
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFDF3]'>
              <Check className='h-[18px] w-[18px] text-[#16A34A]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#ECFDF3] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#16A34A]'>
              +15%
            </span>
          </div>
        </div>

        <div className='border-b-[3.98px] border-[#F97316] rounded-[14px] bg-[#FFFFFF] p-4 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]'>
          <div className='flex items-start justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                مواعيد معلقة
              </div>
              <div className='mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]'>
                2
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#FFF7ED]'>
              <Clock className='h-[18px] w-[18px] text-[#F97316]' />
            </div>
          </div>
          <div className='mt-4 flex items-center justify-end'>
            <span className='rounded-full bg-[#FFF7ED] px-2 py-1 font-cairo text-[11px] font-extrabold text-[#F97316]'>
              +12%
            </span>
          </div>
        </div>
      </section>

      <section className='mt-6 grid grid-cols-2 gap-6'>
        <div>
          <div className='border-b border-[#EEF2F6] px-6 py-8'>
            <div className='font-cairo text-[18px] font-extrabold text-[#111827]'>
              مواعيد اليوم
            </div>
          </div>

          <div className='px-6 py-6'>
            <div className='space-y-6'>
              {[
                {
                  time: '10:00',
                  name: 'أحمد محمد',
                  mode: 'clinic',
                  initial: 'أ',
                },
                {
                  time: '11:30',
                  name: 'فاطمة أحمد',
                  mode: 'video',
                  initial: 'ف',
                },
              ].map((row) => (
                <div
                  key={row.time}
                  className='flex items-center justify-between rounded-[12px] bg-[#F9FAFB] px-4 py-3'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[8px] bg-[#16C5C0] text-white'>
                      <span className='font-cairo text-[14px] font-extrabold'>
                        {row.initial}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                        {row.name}
                      </div>
                      <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                        {row.mode}
                      </div>
                    </div>
                  </div>
                  <div className='text-left'>
                    <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {row.time}
                    </div>
                    <div className='mt-1 inline-flex h-[22px] items-center justify-center border-[1.82px] border-[#16C5C01A] rounded-[6px] text-[#16C5C0] px-2 font-cairo text-[11px] font-extrabold bg-[#16C5C01A]'>
                      مجدول
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className='border-b border-[#EEF2F6] px-6 py-8'>
            <div className='font-cairo text-[18px] font-extrabold text-[#111827]'>
              المرضى
            </div>
          </div>

          <div className='px-6 py-5'>
            <div className='relative'>
              <input
                placeholder='بحث...'
                className='h-[38px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pr-10 pl-4 font-cairo text-[13px] font-bold text-[#111827] placeholder:font-cairo placeholder:text-[13px] placeholder:font-semibold placeholder:text-[#98A2B3]'
              />
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                <Search />
              </div>
            </div>

            <div className='flex flex-col justify-between mt-4 rounded-[12px] bg-[#16C5C01A] min-h-[220px] p-5'>
              <div className='font-cairo text-[13px] px-4 font-bold text-[#667085]'>
                نشاط المواعيد - آخر 7 أيام
              </div>
              <div>
                <div className='mt-6 flex items-end justify-between gap-2'>
                  {[
                    { day: 'السبت', h: 20 },
                    { day: 'الأحد', h: 40 },
                    { day: 'الاثنين', h: 100 },
                    { day: 'الثلاثاء', h: 20 },
                    { day: 'الأربعاء', h: 50 },
                    { day: 'الخميس', h: 20 },
                    { day: 'الجمعة', h: 10 },
                  ].map((item) => (
                    <div key={item.day} className='flex flex-1 flex-col items-center gap-2'>
                      <div
                        className='w-full max-w-[42px] rounded-t-[12px] bg-[#16C5C0]'
                        style={{ height: `${item.h}px` }}
                      />
                      <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                        {item.day}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-4 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  متوسط: 0 موعد/يوم
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mt-6'>
        <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
          <div className='font-cairo text-[18px] font-extrabold mb-4 text-[#111827]'>
            المرضى
          </div>

          <div className='flex items-center gap-2'>
            {['الكل', 'نشط', 'معلّق'].map((status, index) => (
              <button
                key={index}
                type='button'
                onClick={() => setActiveStatus(status)}
                className={`h-[32px] rounded-[8px] border border-[#E5E7EB] ${activeStatus === status ? 'bg-[#F3F4F6]' : 'bg-white'} px-3 font-cairo text-[12px] font-extrabold text-[#111827]`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className='overflow-hidden'>
          <div className='grid grid-cols-12 border-b border-[#EEF2F6] bg-white px-6 py-3'>
            {[
              'اسم المريض',
              'رقم الهاتف',
              'آخر زيارة',
              'الحالة',
              'الإجراءات',
              '',
            ].map((label, index) => (
              <div
                key={index}
                className={`${label === 'اسم المريض' ? 'col-span-4' : 'col-span-2'} font-cairo text-[12px] font-bold text-[#667085] pt-2 pb-0`}
              >
                {label}
              </div>
            ))}
          </div>

          {[0, 1].map((idx) => (
            <div
              key={idx}
              className='grid grid-cols-12 items-center border-b border-[#EEF2F6] px-6 py-4'
            >
              <div className='col-span-4 flex items-center gap-3'>
                <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#16C5C0] text-white shadow-[0_10px_18px_rgba(22,197,192,0.25)]'>
                  <span className='font-cairo text-[14px] font-extrabold'>
                    {idx === 0 ? 'أ' : 'ف'}
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                    {idx === 0 ? 'أحمد محمد' : 'فاطمة أحمد'}
                  </div>
                  <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    {idx === 0
                      ? 'patient1@example.com'
                      : 'patient2@example.com'}
                  </div>
                </div>
              </div>

              <div className='col-span-2 font-cairo text-[12px] font-bold text-[#111827]'>
                {idx === 0 ? '+966501234567' : '+966502345678'}
              </div>
              <div className='col-span-2 font-cairo text-[14px] text-[#111827]'>
                ٢٠٢٦/٢/٣
              </div>
              <div className='col-span-2'>
                <span className='inline-flex h-[22px] items-center justify-center rounded-[6px] bg-[#ECFDF3] px-3 font-cairo text-[11px] font-extrabold text-[#16A34A]'>
                  نشط
                </span>
              </div>
              <div className='col-span-2 text-left'>
                <button
                  type='button'
                  className='flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#16C5C0]'
                >
                  عرض التفاصيل
                  <ChevronRight className='text-[#16C5C0] w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='mt-6 grid grid-cols-3 gap-6'>
        <div className='rounded-[16px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                التقييم
              </div>
              <div className='mt-1 font-cairo text-[20px] font-extrabold text-[#111827]'>
                4.9/5
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFDF3]'>
              <TrendingUp className='h-[18px] w-[18px] text-[#16A34A]' />
            </div>
          </div>
        </div>

        <div className='rounded-[16px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                نسبة الحضور
              </div>
              <div className='mt-1 font-cairo text-[20px] font-extrabold text-[#111827]'>
                94%
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#F5F3FF]'>
              <Plus className='h-[18px] w-[18px] text-[#7C3AED]' />
            </div>
          </div>
        </div>

        <div className='rounded-[16px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex items-center justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[13px] font-bold text-[#667085]'>
                السجلات الطبية
              </div>
              <div className='mt-1 font-cairo text-[20px] font-extrabold text-[#111827]'>
                6
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#EFF6FF]'>
              <FileText className='h-[18px] w-[18px] text-[#2563EB]' />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
