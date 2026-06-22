'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { AlertTriangle, X, LucideIcon } from 'lucide-react';
import { useEffect, ReactNode } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
  customActions?: ReactNode;
  maxWidth?: string;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  isLoading = false,
  icon: Icon,
  children,
  customActions,
  maxWidth = '520px',
}: ConfirmDialogProps) {
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

  const variantStyles = {
    danger: {
      iconBg: 'bg-[#FEE2E2]',
      iconColor: 'text-[#DC2626]',
      confirmBg: 'bg-gradient-to-b from-[#DC2626] to-[#B91C1C]',
      confirmShadow: 'shadow-[0_14px_24px_rgba(220,38,38,0.25)]',
    },
    warning: {
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
      confirmBg: 'bg-gradient-to-b from-[#D97706] to-[#B45309]',
      confirmShadow: 'shadow-[0_14px_24px_rgba(217,119,6,0.25)]',
    },
    info: {
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
      confirmBg: 'bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]',
      confirmShadow: 'shadow-[0_14px_24px_rgba(37,99,235,0.25)]',
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = Icon || AlertTriangle;

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
            className='fixed left-1/2 top-1/2 z-[10000] max-h-[calc(100dvh-24px)] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] outline-none'
            style={{ width: maxWidth }}
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
              <div className='relative px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] sm:left-5 sm:top-5 lg:left-6 lg:top-6'
                    aria-label='إغلاق'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </Dialog.Close>

                <div className='flex flex-col items-center'>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg}`}
                  >
                    <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
                  </div>

                  <Dialog.Title className='mt-5 text-center font-cairo text-[20px] font-extrabold leading-[26px] text-[#111827]'>
                    {title}
                  </Dialog.Title>

                  <Dialog.Description className='mt-3 text-center font-cairo text-[14px] font-semibold leading-[20px] text-[#667085]'>
                    {description}
                  </Dialog.Description>
                </div>
              </div>

              {children && (
                <>
                  <div className='mt-5 h-px w-full bg-[#EEF2F6]' />
                  <div className='max-h-[40dvh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8'>
                    {children}
                  </div>
                </>
              )}

              <div className={`${children ? '' : 'mt-7'} h-px w-full bg-[#EEF2F6]`} />

              {customActions ? (
                <div className='px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8 lg:pb-7 lg:pt-6'>
                  {customActions}
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-3 px-4 pb-5 pt-4 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8 lg:pb-7 lg:pt-6'>
                  <Dialog.Close asChild>
                    <button
                      type='button'
                      className='h-[46px] w-full rounded-[10px] border border-[#D0D5DD] bg-[#F9FAFB] font-cairo text-[14px] font-extrabold text-[#344054] transition-colors hover:bg-[#F2F4F7]'
                    >
                      {cancelText}
                    </button>
                  </Dialog.Close>

                  <button
                    type='button'
                    onClick={async () => {
                      if (onConfirm) {
                        await onConfirm();
                      }
                      onOpenChange(false);
                    }}
                    disabled={isLoading}
                    className={`h-[46px] w-full rounded-[10px] ${styles.confirmBg} font-cairo text-[14px] font-extrabold text-white ${styles.confirmShadow} transition-opacity disabled:opacity-50`}
                  >
                    {isLoading ? 'جارِ التنفيذ...' : confirmText}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
