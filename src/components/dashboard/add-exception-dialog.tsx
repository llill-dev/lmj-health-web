'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type ExceptionFormValues = {
  date: string;
  exceptionType: 'vacation' | 'unavailable';
  reason: string;
};

export default function AddExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExceptionFormValues) => void;
}) {
  const [date, setDate] = useState('');
  const [exceptionType, setExceptionType] =
    useState<ExceptionFormValues['exceptionType']>('vacation');
  const [reason, setReason] = useState('');

  const typeLabel = useMemo(() => {
    return exceptionType === 'vacation' ? 'إجازة' : 'غير متاح';
  }, [exceptionType]);

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
            className='fixed left-1/2 top-1/2 z-[10000] w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
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
                    className='absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
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
                    onSubmit({ date, exceptionType, reason });
                    onOpenChange(false);
                    setDate('');
                    setExceptionType('vacation');
                    setReason('');
                  }}
                >
                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      التاريخ
                    </div>
                    <input
                      type='date'
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className='h-[44px] w-full rounded-[12px] border-[1.82px] border-[#16C5C0] bg-white px-4 font-cairo text-[13px] font-bold text-[#111827] outline-none'
                      required
                    />
                  </div>

                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      نوع الاستثناء
                    </div>
                    <div className='relative'>
                      <select
                        value={exceptionType}
                        onChange={(e) =>
                          setExceptionType(
                            e.target
                              .value as ExceptionFormValues['exceptionType'],
                          )
                        }
                        className='h-[44px] w-full appearance-none rounded-[12px] border-[1.82px] border-[#16C5C0] bg-white px-4 font-cairo text-[13px] font-extrabold text-[#111827] outline-none'
                      >
                        <option value='vacation'>إجازة</option>
                        <option value='unavailable'>غير متاح</option>
                      </select>
                      <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]'>
                        <ChevronDown className='h-4 w-4' />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='mb-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      السبب
                    </div>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder='مثال: إجازة رسمية - عيد الفطر'
                      className='min-h-[88px] w-full resize-none rounded-[12px] border-[1.82px] border-[#16C5C0] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                      required
                    />
                  </div>

                  <div className='flex items-center justify-end gap-3 pb-7 pt-2'>
                    <Dialog.Close asChild>
                      <button
                        type='button'
                        className='h-[40px] rounded-[12px] border border-[#E5E7EB] bg-white px-6 font-cairo text-[13px] font-extrabold text-[#344054]'
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>

                    <button
                      type='submit'
                      className='h-[40px] rounded-[12px] bg-[#16C5C0] px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(22,197,192,0.25)]'
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
