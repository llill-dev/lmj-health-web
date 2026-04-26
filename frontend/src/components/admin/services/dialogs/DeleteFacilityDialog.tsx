'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { useDeleteFacility } from '@/hooks/useAdminServices';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import type { FacilitySummary } from '@/lib/admin/services/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: FacilitySummary | null;
}

export default function DeleteFacilityDialog({
  open,
  onOpenChange,
  facility,
}: Props) {
  const deleteMutation = useDeleteFacility();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleConfirm = async () => {
    if (!facility) return;
    try {
      await deleteMutation.mutateAsync(facility.id);
      onOpenChange(false);
    } catch {
      // error shown inline
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: { opacity: 1, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: 0.22 } },
              closed: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.18 }, transitionEnd: { visibility: 'hidden' as const } },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                x: '-50%',
                y: '-50%',
                scale: 1,
                transition: { type: 'spring', stiffness: 520, damping: 38 },
              },
              closed: {
                opacity: 0,
                x: '-50%',
                y: 'calc(-50% + 20px)',
                scale: 0.97,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18, ease: 'easeOut' },
                transitionEnd: { visibility: 'hidden' as const },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[440px] max-w-[calc(100vw-24px)] rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <div className='px-7 pb-6 pt-5'>
              {/* Close */}
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='absolute left-5 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                >
                  <X className='h-4 w-4' />
                </button>
              </Dialog.Close>

              {/* Icon */}
              <div className='mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-red-50'>
                <AlertTriangle className='h-6 w-6 text-[#F04438]' />
              </div>

              <Dialog.Title className='text-center font-cairo text-[18px] font-extrabold text-[#101828]'>
                حذف المنشأة
              </Dialog.Title>

              <Dialog.Description className='mt-2 text-center font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]'>
                هل أنت متأكد من حذف{' '}
                <span className='font-extrabold text-[#101828]'>
                  {facility?.name}
                </span>
                ؟<br />
                سيتم إلغاء تعيين جميع الأطباء المرتبطين بهذه المنشأة.
              </Dialog.Description>

              {deleteMutation.isError && (
                <div className='mt-3 rounded-[8px] bg-red-50 px-3 py-2 text-center font-cairo text-[12px] font-bold text-red-600'>
                  {userFacingErrorMessage(
                    deleteMutation.error,
                    'تعذّر حذف المنشأة',
                  )}
                </div>
              )}

              <div className='mt-6 flex items-center justify-center gap-3'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-[40px] rounded-[10px] border border-[#D0D5DD] bg-white px-8 font-cairo text-[13px] font-extrabold text-[#344054]'
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='button'
                  disabled={deleteMutation.isPending}
                  onClick={handleConfirm}
                  className='h-[40px] rounded-[10px] bg-[#F04438] px-8 font-cairo text-[13px] font-extrabold text-white disabled:opacity-60'
                >
                  {deleteMutation.isPending ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
