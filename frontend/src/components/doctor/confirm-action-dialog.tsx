'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
}) {
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
            className='fixed left-1/2 top-1/2 z-[10000] w-[460px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
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
                  y: 18,
                  scale: 0.97,
                  transition: { duration: 0.2, ease: 'easeOut' },
                },
              }}
              style={{ transformOrigin: 'center' }}
            >
              <div className='relative px-7 pb-6 pt-5'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <Dialog.Title className='text-start font-cairo text-[20px] font-extrabold leading-[28px] text-[#101828]'>
                  {title}
                </Dialog.Title>

                <Dialog.Description className='mt-2 text-right font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]'>
                  {description}
                </Dialog.Description>

                <div className='mt-6 flex items-center justify-end gap-3'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[40px] rounded-[10px] border border-[#F04438] bg-white px-8 font-cairo text-[14px] font-extrabold text-[#F04438]'
                    >
                      إلغاء
                    </button>
                  </Dialog.Close>

                  <button
                    type='button'
                    disabled={confirmDisabled}
                    onClick={async () => {
                      await onConfirm();
                      onOpenChange(false);
                    }}
                    className='h-[40px] rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.22)] disabled:opacity-60'
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
