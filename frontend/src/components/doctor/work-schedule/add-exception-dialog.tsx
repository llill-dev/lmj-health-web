'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, ChevronDown, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ScheduleDayKey } from '@/lib/doctor/types';

export type ExceptionFormValues = {
  date: string;
  exceptionType: 'closed' | 'custom_hours';
  slots: Array<{ startTime: string; endTime: string }>;
  note: string;
};

interface AddExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExceptionFormValues) => void;
  enabledDays?: ScheduleDayKey[];
}

export default function AddExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  enabledDays = [],
}: AddExceptionDialogProps) {
  const [date, setDate] = useState('');
  const [exceptionType, setExceptionType] =
    useState<ExceptionFormValues['exceptionType']>('closed');
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState<Array<{ startTime: string; endTime: string }>>([
    { startTime: '', endTime: '' },
  ]);
  const [dateError, setDateError] = useState<string | null>(null);

  const typeLabel = useMemo(() => {
    return exceptionType === 'closed' ? 'يوم مغلق' : 'ساعات مخصصة';
  }, [exceptionType]);

  // Add new slot
  const handleAddSlot = () => {
    setSlots([...slots, { startTime: '', endTime: '' }]);
  };

  // Remove slot
  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // Update slot
  const handleSlotChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  // Validate date against enabled days
  const validateDate = (selectedDate: string) => {
    if (!selectedDate) {
      setDateError(null);
      return false;
    }

    if (enabledDays.length === 0) {
      // If no enabled days provided, skip validation (backend will handle it)
      setDateError(null);
      return true;
    }

    const date = new Date(selectedDate + 'T00:00:00');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) as ScheduleDayKey;

    if (!enabledDays.includes(dayName)) {
      const arabicDays: Record<ScheduleDayKey, string> = {
        Sunday: 'الأحد',
        Monday: 'الإثنين',
        Tuesday: 'الثلاثاء',
        Wednesday: 'الأربعاء',
        Thursday: 'الخميس',
        Friday: 'الجمعة',
        Saturday: 'السبت',
      };

      setDateError(
        `لا يمكن إضافة استثناء في يوم ${arabicDays[dayName]} لأنه غير موجود في جدول العمل الأسبوعي. الأيام المتاحة: ${enabledDays.map((d) => arabicDays[d]).join('، ')}`
      );
      return false;
    }

    setDateError(null);
    return true;
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    validateDate(newDate);
  };

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          asChild
        >
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transition: { duration: 0.22, ease: 'easeOut' },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.22, ease: 'easeOut' },
                pointerEvents: 'none',
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>

        <Dialog.Content
          forceMount
          asChild
        >
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transition: { duration: 0.18, ease: 'easeOut' },
              },
              closed: {
                opacity: 0,
                transition: { duration: 0.18, ease: 'easeOut' },
                pointerEvents: 'none',
                transitionEnd: { visibility: 'hidden' },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 520, damping: 38 },
                },
                closed: {
                  opacity: 0,
                  y: 24,
                  scale: 0.96,
                  transition: { duration: 0.22, ease: 'easeOut' },
                },
              }}
              style={{ transformOrigin: 'center' }}
            >
              <div className='relative px-8 pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-f6l text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-center font-cairo text-[20px] font-extrabold leading-[26px] text-[#111827]'>
                  إضافة استثناء جديد
                </Dialog.Title>
                <Dialog.Description className='mt-1 text-center font-cairo text-[12px] font-semibold leading-[18px] text-[#98A2B3]'>
                  حدد تاريخ ووقت الاستثناء
                </Dialog.Description>

                <form
                  className='mt-6 space-y-4'
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!validateDate(date)) {
                      return;
                    }
                    
                    const finalSlots = exceptionType === 'closed' ? [] : slots.filter(s => s.startTime && s.endTime);
                    
                    onSubmit({ 
                      date, 
                      exceptionType, 
                      slots: finalSlots,
                      note: note.trim() || (exceptionType === 'closed' ? 'يوم مغلق' : 'ساعات مخصصة'),
                    });
                    onOpenChange(false);
                    setDate('');
                    setExceptionType('closed');
                    setNote('');
                    setSlots([{ startTime: '', endTime: '' }]);
                    setDateError(null);
                  }}
                >
                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      التاريخ
                    </div>
                    <input
                      type='date'
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className='h-[44px] w-full rounded-[6px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                      required
                    />
                    {dateError && (
                      <div className='mt-2 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3'>
                        <AlertCircle className='h-4 w-4 text-amber-600 mt-0.5 shrink-0' />
                        <p className='text-xs text-amber-900 text-right leading-relaxed'>
                          {dateError}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      نوع الاستثناء
                    </div>
                    <div className='relative'>
                      <select
                        value={exceptionType}
                        onChange={(e) => {
                          const newType = e.target.value as ExceptionFormValues['exceptionType'];
                          setExceptionType(newType);
                          if (newType === 'closed') {
                            setSlots([]);
                          } else if (slots.length === 0) {
                            setSlots([{ startTime: '', endTime: '' }]);
                          }
                        }}
                        className='h-[44px] w-full appearance-none rounded-[6px] border-[1.82px] border-primary bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none'
                      >
                        <option value='closed'>يوم مغلق (لا توجد فترات متاحة)</option>
                        <option value='custom_hours'>ساعات عمل مخصصة</option>
                      </select>
                      <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                        <ChevronDown className='h-4 w-4' />
                      </div>
                    </div>
                    <p className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#667085]'>
                      {exceptionType === 'closed' 
                        ? 'سيتم إغلاق هذا اليوم بالكامل ولن يكون متاحاً للحجز'
                        : 'حدد ساعات العمل المخصصة لهذا اليوم'}
                    </p>
                  </div>

                  {exceptionType === 'custom_hours' && (
                    <div>
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                          الفترات المتاحة
                        </div>
                        <button
                          type='button'
                          onClick={handleAddSlot}
                          className='rounded-[6px] bg-primary/10 px-3 py-1 font-cairo text-[11px] font-extrabold text-primary hover:bg-primary/20'
                        >
                          + إضافة فترة
                        </button>
                      </div>
                      <div className='space-y-2'>
                        {slots.map((slot, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-2'
                          >
                            <input
                              type='time'
                              value={slot.startTime}
                              onChange={(e) =>
                                handleSlotChange(index, 'startTime', e.target.value)
                              }
                              className='h-[40px] flex-1 rounded-[6px] border-[1.82px] border-primary bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                              required={exceptionType === 'custom_hours'}
                            />
                            <span className='font-cairo text-[12px] font-semibold text-[#667085]'>
                              إلى
                            </span>
                            <input
                              type='time'
                              value={slot.endTime}
                              onChange={(e) =>
                                handleSlotChange(index, 'endTime', e.target.value)
                              }
                              className='h-[40px] flex-1 rounded-[6px] border-[1.82px] border-primary bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                              required={exceptionType === 'custom_hours'}
                            />
                            {slots.length > 1 && (
                              <button
                                type='button'
                                onClick={() => handleRemoveSlot(index)}
                                className='flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-[#FEF3F2] text-[#F04438] hover:bg-[#F04438] hover:text-white'
                              >
                                <X className='h-4 w-4' />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      ملاحظة (اختياري)
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder='مثال: إجازة رسمية - عيد الفطر'
                      className='min-h-[88px] w-full resize-none rounded-[6px] border-[1.82px] border-primary bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                    />
                  </div>

                  <div className='flex items-center justify-end gap-3 pb-7 pt-2'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='h-[40px] rounded-[6px] border border-[#E5E7EB] bg-white px-6 font-cairo text-[13px] font-extrabold text-[#344054]'
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>

                    <button
                      type='submit'
                      disabled={!!dateError}
                      className='h-[40px] rounded-[6px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)] disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      إضافة
                    </button>
                  </div>

                  <div className='hidden'>{typeLabel}</div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
