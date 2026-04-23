'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Power } from 'lucide-react';
import { useEffect } from 'react';
import type { ServiceType } from '@/lib/admin/services/types';
import { resolveLabel } from '@/lib/admin/services/types';

type Action = 'deactivate' | 'activate';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: ServiceType | null;
  action: Action;
  onConfirm: () => void;
  isPending: boolean;
};

const overlayOpen = {
  opacity: 1,
  visibility: 'visible' as const,
  pointerEvents: 'auto' as const,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

const overlayClosed = {
  opacity: 0,
  transition: { duration: 0.18, ease: 'easeOut' as const },
  pointerEvents: 'none' as const,
  transitionEnd: { visibility: 'hidden' as const },
};

const panelOpen = {
  opacity: 1,
  visibility: 'visible' as const,
  pointerEvents: 'auto' as const,
  y: 0,
  scale: 1,
  transition: { type: 'spring' as const, stiffness: 420, damping: 32 },
};

const panelClosed = {
  opacity: 0,
  y: 16,
  scale: 0.96,
  pointerEvents: 'none' as const,
  transition: { duration: 0.2, ease: 'easeOut' as const },
  transitionEnd: { visibility: 'hidden' as const },
};

export default function ServiceTypeStatusConfirmDialog({
  open,
  onOpenChange,
  serviceType,
  action,
  onConfirm,
  isPending,
}: Props) {
  const title = serviceType
    ? resolveLabel(
        typeof serviceType.name === 'string'
          ? { en: serviceType.name, ar: serviceType.name }
          : serviceType.name,
        'ar',
      )
    : '—';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isDeactivate = action === 'deactivate';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: overlayOpen, closed: overlayClosed }}
            className='fixed inset-0 z-[10050] bg-black/45 backdrop-blur-[2px]'
            style={{ touchAction: 'none' }}
          />
        </Dialog.Overlay>
        <Dialog.Content
          forceMount
          onOpenAutoFocus={(e) => e.preventDefault()}
          className='fixed left-1/2 top-1/2 z-[10060] w-[min(100vw-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none outline-none'
          dir='rtl'
          lang='ar'
        >
          <Dialog.Description className='sr-only'>
            تأكيد تغيير حالة تفعيل نوع الخدمة في النظام.
          </Dialog.Description>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: panelOpen, closed: panelClosed }}
            className='w-full rounded-[16px] bg-white p-0 shadow-[0_24px_60px_rgba(0,0,0,0.2)]'
          >
            <div className='flex items-start justify-between border-b border-[#F2F4F7] px-5 py-4'>
              <div className='flex items-center gap-2'>
                <div
                  className={
                    isDeactivate
                      ? 'flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600'
                      : 'flex h-10 w-10 items-center justify-center rounded-full bg-[#E7FBFA] text-primary'
                  }
                >
                  <Power className='h-5 w-5' />
                </div>
                <Dialog.Title className='font-cairo text-[16px] font-extrabold leading-snug text-[#101828]'>
                  {isDeactivate ? 'تعطيل نوع الخدمة' : 'تفعيل نوع الخدمة'}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F2F4F7]'
                  aria-label='إغلاق'
                >
                  <X className='h-4 w-4' />
                </button>
              </Dialog.Close>
            </div>
            <div className='px-5 py-4'>
              <p className='text-right font-cairo text-[14px] font-semibold leading-relaxed text-[#475467]'>
                {isDeactivate
                  ? `سيتم إخفاء نوع الخدمة «${title || '—'}» عن القوائم العامة (isActive: false). يمكنك إعادة تفعيله لاحقاً.`
                  : `سيتم تفعيل نوع الخدمة «${title || '—'}» مرة أخرى.`}
              </p>
            </div>
            <div className='flex items-center justify-end gap-2 border-t border-[#F2F4F7] px-5 py-4'>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='h-10 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-50'
                  disabled={isPending}
                >
                  إلغاء
                </button>
              </Dialog.Close>
              <button
                type='button'
                onClick={onConfirm}
                disabled={isPending}
                className={
                  isDeactivate
                    ? 'h-10 rounded-[10px] bg-amber-600 px-4 font-cairo text-[12px] font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50'
                    : 'h-10 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.35)] transition hover:brightness-105 disabled:opacity-50'
                }
              >
                {isPending ? 'جاري التنفيذ…' : isDeactivate ? 'تعطيل' : 'تفعيل'}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
