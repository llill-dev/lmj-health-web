'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useCreateMedicalOrderCatalogItem,
  useUpdateMedicalOrderCatalogItem,
} from '@/hooks/useAdminMedicalOrderCatalog';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: MedicalOrderCatalogKind;
  editTarget?: MedicalOrderCatalogItem | null;
};

export default function UpsertMedicalOrderItemDialog({
  open,
  onOpenChange,
  kind,
  editTarget,
}: Props) {
  const isEdit = !!editTarget;
  const [label, setLabel] = useState('');
  const createMut = useCreateMedicalOrderCatalogItem();
  const updateMut = useUpdateMedicalOrderCatalogItem(kind);
  const pending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) {
      setLabel(editTarget?.label ?? '');
    }
  }, [open, editTarget]);

  const serverErr = createMut.error ?? updateMut.error;
  const serverError = serverErr
    ? userFacingErrorMessage(serverErr)
    : undefined;

  const inputClass =
    'h-[42px] w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;

    if (isEdit && editTarget) {
      updateMut.mutate(
        { id: editTarget._id, label: trimmed },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      createMut.mutate(
        { kind, label: trimmed },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                transition: { duration: 0.22 },
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18 },
                transitionEnd: { visibility: 'hidden' as const },
              },
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
            className='fixed left-1/2 top-1/2 z-[10000] w-[440px] max-w-[calc(100vw-24px)] rounded-[16px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
            dir='rtl'
            lang='ar'
          >
            <div className='flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4'>
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                {isEdit ? 'تعديل نوع الطلب' : 'إضافة نوع جديد'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                >
                  <X className='h-4 w-4' />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='px-5 py-4'>
                <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                  الاسم المعروض
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder='مثال: complete blood count (CBC)'
                  className={inputClass}
                  autoFocus
                />
                {serverError && (
                  <p className='mt-2 text-right font-cairo text-[12px] font-semibold text-[#D92D20]'>
                    {serverError}
                  </p>
                )}
              </div>
              <div className='flex justify-end gap-2 border-t border-[#F2F4F7] px-5 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-10 rounded-[8px] px-4 font-cairo text-[13px] font-extrabold text-[#667085] hover:bg-[#F2F4F7]'
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={pending || !label.trim()}
                  className='h-10 rounded-[8px] bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-sm hover:opacity-95 disabled:pointer-events-none disabled:opacity-50'
                >
                  {pending ? 'جاري الحفظ…' : isEdit ? 'حفظ التعديل' : 'إضافة'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
