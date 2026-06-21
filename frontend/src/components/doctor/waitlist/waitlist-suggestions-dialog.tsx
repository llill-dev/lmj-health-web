'use client';

import { useState } from 'react';
import { Lightbulb, X, Clock, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlistSuggestions } from '@/hooks/doctor/useDoctorWaitlist';

export default function WaitlistSuggestionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const suggestions = useWaitlistSuggestions(
    { date: selectedDate, type: 'freeSlots' },
    open,
  );

  const handleClose = () => {
    onClose();
  };

  // Get min date (today) in YYYY-MM-DD format
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Get max date (+3 months) in YYYY-MM-DD format
  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-SY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '—';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'مساءً' : 'صباحاً';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-[600px] max-h-[80vh] overflow-hidden rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
          >
            <div className='border-b border-[#EEF2F6] px-8 py-5'>
              <div className='flex items-center justify-between gap-4'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085] transition hover:bg-[#E5E7EB]'
                  aria-label='إغلاق'
                >
                  <X className='h-4 w-4' />
                </button>

                <div className='flex items-center gap-3'>
                  <div className='text-right font-cairo text-[15px] font-extrabold text-[#111827]'>
                    اقتراحات المواعيد المتاحة
                  </div>
                  <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FEF6EE]'>
                    <Lightbulb className='h-5 w-5 text-[#F79009]' />
                  </div>
                </div>
              </div>
            </div>

            <div className='px-8 py-6 max-h-[calc(80vh-140px)] overflow-y-auto' dir='rtl'>
              <div className='space-y-5'>
                <div className='rounded-[6px] bg-[#FFFAEB] px-5 py-4 text-right'>
                  <div className='flex items-start justify-start gap-3'>
                    <Lightbulb className='h-4 w-4 text-[#F79009] mt-0.5' />
                    <div className='flex flex-col gap-1'>
                      <div className='font-cairo text-[12px] font-extrabold text-[#F79009]'>
                        مساعد الجدولة
                      </div>
                      <div className='font-cairo text-[11px] font-semibold text-[#F79009]'>
                        هذه الأوقات المقترحة تساعدك في تنظيم المواعيد بناءً على
                        الفترات المتاحة في جدولك.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                    اختر تاريخاً
                  </div>
                  <div className='relative'>
                    <input
                      type='date'
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      max={maxDate}
                      className='h-[44px] w-full cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20'
                    />
                    <Calendar
                      className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]'
                      aria-hidden
                    />
                  </div>
                  <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                    {formatDate(selectedDate)}
                  </div>
                </div>

                <div>
                  <div className='mb-3 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                    الأوقات المتاحة
                  </div>

                  {suggestions.isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <div className='flex items-center gap-3'>
                        <Loader2 className='h-5 w-5 animate-spin text-primary' />
                        <span className='font-cairo text-[13px] font-semibold text-[#667085]'>
                          جارٍ تحميل الاقتراحات...
                        </span>
                      </div>
                    </div>
                  ) : suggestions.isError ? (
                    <div className='rounded-[6px] bg-[#FEF3F2] px-5 py-4 text-right'>
                      <div className='font-cairo text-[12px] font-semibold text-[#B42318]'>
                        تعذّر تحميل الاقتراحات. حاول مرة أخرى.
                      </div>
                    </div>
                  ) : !suggestions.data?.freeSlots?.length ? (
                    <div className='rounded-[6px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-5 py-8 text-center'>
                      <Clock className='mx-auto h-8 w-8 text-[#98A2B3] mb-3' />
                      <div className='font-cairo text-[13px] font-extrabold text-[#667085]'>
                        لا توجد أوقات متاحة في هذا التاريخ
                      </div>
                      <div className='mt-1 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                        جرّب تاريخاً آخر لعرض الاقتراحات
                      </div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-2 gap-3'>
                      {suggestions.data.freeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-3 rounded-[6px] border border-[#D0F0C0] bg-[#F0FDF4] px-4 py-3'
                        >
                          <div className='flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-white'>
                            <Clock className='h-4 w-4 text-[#16A34A]' />
                          </div>
                          <div className='flex-1 text-right'>
                            <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                              {formatTime(slot.startTime)}
                            </div>
                            {slot.endTime && (
                              <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                                إلى {formatTime(slot.endTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='border-t border-[#EEF2F6] px-8 py-5'>
              <motion.button
                type='button'
                onClick={handleClose}
                className='h-[48px] w-full rounded-[6px] bg-[#F2F4F7] font-cairo text-[13px] font-extrabold text-[#667085] transition hover:bg-[#E5E7EB]'
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                إغلاق
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
