'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ScheduleDayKey, ScheduleTimeSlot } from '@/lib/doctor/types';

export type EditDayFormValues = {
  day: ScheduleDayKey;
  slots: ScheduleTimeSlot[];
};

const DAY_LABELS: Record<ScheduleDayKey, string> = {
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

export default function EditDayDialog({
  open,
  onOpenChange,
  onSubmit,
  initialDay,
  initialSlots,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EditDayFormValues) => void;
  initialDay: ScheduleDayKey;
  initialSlots: ScheduleTimeSlot[];
}) {
  const [slots, setSlots] = useState<ScheduleTimeSlot[]>(initialSlots);

  useEffect(() => {
    if (open) {
      setSlots(initialSlots);
    }
  }, [open, initialSlots]);

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

  const handleAddSlot = () => {
    setSlots([...slots, { startTime: '14:00', endTime: '17:00' }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ day: initialDay, slots });
    onOpenChange(false);
  };

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
            className='fixed left-1/2 top-1/2 z-[10000] w-[580px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
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
                  تعديل يوم {DAY_LABELS[initialDay]}
                </Dialog.Title>
                <Dialog.Description className='mt-1 text-center font-cairo text-[12px] font-semibold leading-[18px] text-[#98A2B3]'>
                  عدّل أوقات العمل في هذا اليوم
                </Dialog.Description>

                <form
                  className='mt-6 space-y-5'
                  onSubmit={handleSubmit}
                >
                  <div>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                        أوقات العمل
                      </div>
                      <button
                        type='button'
                        onClick={handleAddSlot}
                        className='flex h-[32px] items-center gap-2 rounded-[6px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition-colors hover:bg-[#F2FFFE]'
                      >
                        <Plus className='h-3.5 w-3.5' />
                        إضافة فترة
                      </button>
                    </div>

                    <div className='space-y-3'>
                      {slots.map((slot, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='flex items-center gap-3 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3'
                        >
                          <div className='flex flex-1 items-center gap-3'>
                            <div className='flex-1'>
                              <div className='mb-1 text-right font-cairo text-[11px] font-bold text-[#667085]'>
                                من
                              </div>
                              <input
                                type='time'
                                value={slot.startTime}
                                onChange={(e) => {
                                  const newSlots = [...slots];
                                  newSlots[index].startTime = e.target.value;
                                  setSlots(newSlots);
                                }}
                                className='h-[38px] w-full rounded-[6px] border border-primary bg-white px-3 font-cairo text-[13px] font-extrabold text-[#111827] outline-none'
                                required
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='mb-1 text-right font-cairo text-[11px] font-bold text-[#667085]'>
                                إلى
                              </div>
                              <input
                                type='time'
                                value={slot.endTime}
                                onChange={(e) => {
                                  const newSlots = [...slots];
                                  newSlots[index].endTime = e.target.value;
                                  setSlots(newSlots);
                                }}
                                className='h-[38px] w-full rounded-[6px] border border-primary bg-white px-3 font-cairo text-[13px] font-extrabold text-[#111827] outline-none'
                                required
                              />
                            </div>
                          </div>
                          {slots.length > 1 && (
                            <button
                              type='button'
                              onClick={() => handleRemoveSlot(index)}
                              className='flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] bg-[#FEF3F2] text-[#F04438] transition-colors hover:bg-[#FEE4E2]'
                              aria-label='حذف'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
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
                      className='h-[40px] rounded-[6px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)]'
                    >
                      حفظ التعديلات
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
