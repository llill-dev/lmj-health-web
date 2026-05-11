'use client';
import { Calendar, Clock, Loader2, User } from 'lucide-react';
import { useSlots } from '@/hooks/doctor';
import { cn } from '@/lib/utils/utils';

interface SlotsPreviewProps {
  date: string;
  doctorId?: string;
  className?: string;
}

export default function SlotsPreview({
  date,
  doctorId,
  className,
}: SlotsPreviewProps) {
  const {
    freeSlots,
    bookedSlots,
    totalFreeSlots,
    totalBookedSlots,
    duration,
    gap,
    isLoading,
    error,
  } = useSlots(date, 'all', doctorId);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-[16px] border border-[#EEF2F6] bg-[#FAFBFC] px-6 py-12',
          className,
        )}
      >
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='mt-4 font-cairo text-[14px] font-semibold text-[#667085]'>
          جارِ تحميل الحجوزات...
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
          تعذّر تحميل معلومات الحجوزات
        </p>
        <p className='mt-2 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
          {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
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
            لا توجد حجوزات متاحة في هذا اليوم
          </p>
          <p className='mt-2 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
            قد يكون هذا اليوم خارج جدول العمل الأسبوعي أو مغلقاً كاستثناء
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D1FAE5]'>
              <Clock className='h-6 w-6 text-[#10B981]' />
            </div>
            <div>
              <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
                فترات متاحة
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
                محجوز
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
                المدة الواحدة
              </p>
              <p className='font-cairo text-[20px] font-extrabold text-[#0891B2]'>
                {duration || 0}د
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Free Slots */}
        <div className='rounded-[16px] border border-[#D1FAE5] bg-[#F0FDF4] p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981]'>
              <Clock className='h-4 w-4 text-white' />
            </div>
            <h3 className='font-cairo text-[15px] font-extrabold text-[#065F46]'>
              فترات متاحة ({totalFreeSlots})
            </h3>
          </div>
          <div className='max-h-[300px] space-y-2 overflow-y-auto'>
            {freeSlots.length === 0 ? (
              <p className='py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا توجد فترات متاحة
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
                    إلى
                  </span>
                  <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                    {slot.endTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booked Slots */}
        <div className='rounded-[16px] border border-[#FEE2E2] bg-[#FEF2F2] p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444]'>
              <User className='h-4 w-4 text-white' />
            </div>
            <h3 className='font-cairo text-[15px] font-extrabold text-[#991B1B]'>
              محجوز ({totalBookedSlots})
            </h3>
          </div>
          <div className='max-h-[300px] space-y-2 overflow-y-auto'>
            {bookedSlots.length === 0 ? (
              <p className='py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا توجد حجوزات
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
                      إلى
                    </span>
                    <span className='font-cairo text-[14px] font-bold text-[#111827]'>
                      {slot.endTime}
                    </span>
                  </div>
                  {slot.patientName && (
                    <p className='mt-1 font-cairo text-[12px] font-semibold text-[#667085]'>
                      المريض: {slot.patientName}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
