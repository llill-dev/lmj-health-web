'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled,
  cancelLabel = 'إلغاء',
  variant = 'primary',
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  variant?: 'primary' | 'destructive';
  icon?: ReactNode;
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
            className='fixed left-1/2 top-1/2 z-[10000] w-[460px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <div
              className={
                variant === 'destructive'
                  ? 'h-1 w-full bg-gradient-to-l from-[#DC2626] to-[#F87171]'
                  : 'h-1 w-full bg-gradient-to-l from-[#0F8F8B] to-[#14B3AE]'
              }
              aria-hidden
            />
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 },
                },
                closed: {
                  opacity: 0,
                  y: 14,
                  scale: 0.96,
                  transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                },
              }}
              style={{ transformOrigin: 'center' }}
            >
              <div className='relative px-7 pt-5 pb-6'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition-colors hover:bg-[#F2F4F7]'
                    aria-label='إغلاق'
                  >
                    <X className='w-5 h-5' />
                  </button>
                </Dialog.Close>

                <div className='flex gap-4 items-start pr-1'>
                  {icon ? (
                    <div
                      className={
                        variant === 'destructive'
                          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FEF2F2] text-[#DC2626] shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]'
                          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDFC] text-[#0F8F8B] shadow-[inset_0_0_0_1px_rgba(15,143,139,0.15)]'
                      }
                    >
                      {icon}
                    </div>
                  ) : null}
                  <div className='flex-1 min-w-0'>
                    <Dialog.Title className='text-start font-cairo text-[20px] font-extrabold leading-[28px] text-[#101828]'>
                      {title}
                    </Dialog.Title>

                    <Dialog.Description className='mt-2 text-right font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]'>
                      {description}
                    </Dialog.Description>
                  </div>
                </div>

                <div className='flex flex-wrap gap-3 justify-end items-center mt-6'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[40px] rounded-[10px] border border-[#E4E7EC] bg-white px-8 font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB]'
                    >
                      {cancelLabel}
                    </button>
                  </Dialog.Close>

                  <button
                    type='button'
                    disabled={confirmDisabled}
                    onClick={async () => {
                      try {
                        await Promise.resolve(onConfirm());
                        onOpenChange(false);
                      } catch {
                        /* يبقى الحوار مفتوحاً لإعادة المحاولة */
                      }
                    }}
                    className={
                      variant === 'destructive'
                        ? 'h-[40px] rounded-[10px] bg-gradient-to-b from-[#DC2626] to-[#EF4444] px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(220,38,38,0.28)] transition hover:brightness-[1.03] disabled:opacity-60'
                        : 'h-[40px] rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.22)] transition hover:brightness-[1.03] disabled:opacity-60'
                    }
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
