'use client';
import { Calendar, Clock, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import { useSlots } from '@/hooks/doctor';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

interface SlotsPreviewProps {
  date: string;
  doctorId?: string;
  className?: string;
}

type SlotFilterType = 'all' | 'free' | 'booked';

export default function SlotsPreview({
  date,
  doctorId,
  className,
}: SlotsPreviewProps) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const [filterType, setFilterType] = useState<SlotFilterType>('all');

  const {
    freeSlots,
    bookedSlots,
    totalFreeSlots,
    totalBookedSlots,
    duration,
    isAwaitingData,
    error,
  } = useSlots(date, filterType, doctorId);

  if (isAwaitingData) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-[16px] border border-[#EEF2F6] bg-[#FAFBFC] px-6 py-12',
          className,
        )}
      >
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='mt-4 font-cairo text-[14px] font-semibold text-[#667085]'>
          {tr('جارِ تحميل الحجوزات...', 'Loading bookings...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-[16px] border border-[#FEE4E2] bg-[#FEF3F2] px-6 py-8',
          className,
        )}
      >
        <p className='text-center font-cairo text-[14px] font-bold text-[#D92D20]'>
          {tr('تعذّر تحميل معلومات الحجوزات', 'Could not load booking information')}
        </p>
        <p className='mt-2 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
          {error instanceof Error
            ? error.message
            : tr('حدث خطأ غير متوقع', 'An unexpected error occurred')}
        </p>
      </div>
    );
  }

  const hasSlots = freeSlots.length > 0 || bookedSlots.length > 0;

  if (!hasSlots) {
    return (
      <div
        className={cn(
          'rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-12',
          className,
        )}
      >
        <div className='flex flex-col items-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F4F7]'>
            <Calendar className='h-8 w-8 text-[#667085]' />
          </div>
          <p className='mt-4 text-center font-cairo text-[15px] font-extrabold text-[#344054]'>
            {tr(
              'لا توجد حجوزات متاحة في هذا اليوم',
              'No bookings available on this day',
            )}
          </p>
          <p className='mt-2 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
            {tr(
              'قد يكون هذا اليوم خارج جدول العمل الأسبوعي أو مغلقاً كاستثناء',
              'This day may be outside the weekly schedule or closed as an exception',
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex gap-2 rounded-[12px] border border-[#E5E7EB] bg-white p-1'>
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'flex-1 rounded-[8px] px-4 py-2.5 font-cairo text-[13px] font-bold transition-all',
            filterType === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-[#667085] hover:bg-[#F9FAFB]',
          )}
        >
          {tr('الكل', 'All')}
        </button>
        <button
          onClick={() => setFilterType('free')}
          className={cn(
            'flex-1 rounded-[8px] px-4 py-2.5 font-cairo text-[13px] font-bold transition-all',
            filterType === 'free'
              ? 'bg-primary text-white shadow-sm'
              : 'text-[#667085] hover:bg-[#F9FAFB]',
          )}
        >
          {tr('المتاحة', 'Available')}
        </button>
        <button
          onClick={() => setFilterType('booked')}
          className={cn(
            'flex-1 rounded-[8px] px-4 py-2.5 font-cairo text-[13px] font-bold transition-all',
            filterType === 'booked'
              ? 'bg-primary text-white shadow-sm'
              : 'text-[#667085] hover:bg-[#F9FAFB]',
          )}
        >
          {tr('المحجوزة', 'Booked')}
        </button>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D1FAE5]'>
              <Clock className='h-6 w-6 text-[#10B981]' />
            </div>
            <div>
              <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                {tr('فترات متاحة', 'Available slots')}
              </p>
              <p className='font-cairo text-[20px] font-extrabold text-[#10B981]'>
                {totalFreeSlots}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]'>
              <User className='h-6 w-6 text-[#EF4444]' />
            </div>
            <div>
              <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                {tr('محجوز', 'Booked')}
              </p>
              <p className='font-cairo text-[20px] font-extrabold text-[#EF4444]'>
                {totalBookedSlots}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#E0F2FE]'>
              <Clock className='h-6 w-6 text-[#0891B2]' />
            </div>
            <div>
              <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                {tr('المدة الواحدة', 'Slot duration')}
              </p>
              <p className='font-cairo text-[20px] font-extrabold text-[#0891B2]'>
                {duration || 0}
                {tr('د', 'm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          filterType === 'all' ? 'lg:grid-cols-2' : '',
        )}
      >
        {(filterType === 'all' || filterType === 'free') && (
          <div className='rounded-[16px] border border-[#D1FAE5] bg-[#F0FDF4] p-4'>
            <div className='mb-3 flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981]'>
                <Clock className='h-4 w-4 text-white' />
              </div>
              <h3 className='font-cairo text-[15px] font-extrabold text-[#065F46]'>
                {tr('فترات متاحة', 'Available slots')} ({totalFreeSlots})
              </h3>
            </div>
            <div className='max-h-[300px] space-y-2 overflow-y-auto'>
              {freeSlots.length === 0 ? (
                <p className='py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                  {tr('لا توجد فترات متاحة', 'No available slots')}
                </p>
              ) : (
                freeSlots.map((slot, idx) => (
                  <div
                    key={`free-${idx}`}
                    className='flex items-center justify-between rounded-[8px] bg-white px-3 py-2 shadow-sm'
                  >
                    <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                      {slot.startTime}
                    </span>
                    <span className='font-cairo text-[12px] font-semibold text-[#667085]'>
                      {tr('إلى', 'to')}
                    </span>
                    <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                      {slot.endTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(filterType === 'all' || filterType === 'booked') && (
          <div className='rounded-[16px] border border-[#FEE2E2] bg-[#FEF2F2] p-4'>
            <div className='mb-3 flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444]'>
                <User className='h-4 w-4 text-white' />
              </div>
              <h3 className='font-cairo text-[15px] font-extrabold text-[#991B1B]'>
                {tr('محجوز', 'Booked')} ({totalBookedSlots})
              </h3>
            </div>
            <div className='max-h-[300px] space-y-2 overflow-y-auto'>
              {bookedSlots.length === 0 ? (
                <p className='py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                  {tr('لا توجد حجوزات', 'No bookings')}
                </p>
              ) : (
                bookedSlots.map((slot, idx) => (
                  <div
                    key={`booked-${idx}`}
                    className='rounded-[8px] bg-white px-3 py-2 shadow-sm'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                        {slot.startTime}
                      </span>
                      <span className='font-cairo text-[12px] font-semibold text-[#667085]'>
                        {tr('إلى', 'to')}
                      </span>
                      <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                        {slot.endTime}
                      </span>
                    </div>
                    {slot.patientName && (
                      <p className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                        {tr('المريض:', 'Patient:')} {slot.patientName}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
