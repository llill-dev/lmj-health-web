'use client';

import { Lightbulb, Send, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import StyledSelect from '@/components/ui/styled-select';
import type { FacilityType } from '@/lib/admin/types';

const suggestFacilitySchema = z.object({
  name: z.string().min(2, 'اسم المنشأة مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  facilityType: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

type SuggestFacilityValues = z.infer<typeof suggestFacilitySchema>;

export type SuggestFacilityPayload = {
  name: string;
  city: string;
  facilityType?: FacilityType;
  address?: string;
  phone?: string;
  description?: string;
};

export default function SuggestFacilityDialog({
  open,
  submitting,
  typeOptions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  submitting?: boolean;
  typeOptions: Array<{ value: FacilityType; label: string }>;
  onClose: () => void;
  onSubmit: (values: SuggestFacilityPayload) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuggestFacilityValues>({
    resolver: zodResolver(suggestFacilitySchema),
    defaultValues: {
      name: '',
      city: '',
      facilityType: '',
      address: '',
      phone: '',
      description: '',
    },
  });

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = (values: SuggestFacilityValues) => {
    onSubmit({
      name: values.name,
      city: values.city,
      facilityType: values.facilityType as FacilityType | undefined,
      address: values.address || undefined,
      phone: values.phone || undefined,
      description: values.description || undefined,
    });
  };

  const inputClass =
    'h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20';

  const labelClass =
    'mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]';

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
            className='relative w-full max-w-[520px] rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
          >
            <div className='border-b border-[#EEF2F6] px-8 py-5'>
              <div className='flex items-center justify-between gap-4'>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={submitting}
                  className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085] transition hover:bg-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-50'
                  aria-label='إغلاق'
                >
                  <X className='h-4 w-4' />
                </button>

                <div className='flex items-center gap-3'>
                  <div className='text-right font-cairo text-[15px] font-extrabold text-[#111827]'>
                    اقتراح منشأة جديدة
                  </div>
                  <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#FEF6EE]'>
                    <Lightbulb className='h-5 w-5 text-[#F79009]' />
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(submit)}
              className='px-8 pb-8 pt-6'
              dir='rtl'
            >
              <div className='grid grid-cols-1 gap-5'>
                <div className='rounded-[6px] bg-[#FFFAEB] px-5 py-4 text-right'>
                  <div className='flex items-start justify-start gap-3'>
                    <Lightbulb className='h-4 w-4 text-[#F79009]' />
                    <div className='flex flex-col gap-1'>
                      <div className='font-cairo text-[12px] font-extrabold text-[#F79009]'>
                        ملاحظة
                      </div>
                      <div className='font-cairo text-[11px] font-semibold text-[#F79009]'>
                        اقترح منشأة جديدة إذا لم تجدها في القائمة. سيتم مراجعة
                        الاقتراح وإضافتها للنظام.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={labelClass}>
                    اسم المنشأة <span className='text-[#E11D48]'>*</span>
                  </div>
                  <input
                    type='text'
                    {...register('name')}
                    placeholder='مثلاً: مستشفى الأمل'
                    className={inputClass}
                    disabled={submitting}
                  />
                  {errors.name?.message ? (
                    <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                      {errors.name.message}
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className={labelClass}>
                    المدينة <span className='text-[#E11D48]'>*</span>
                  </div>
                  <input
                    type='text'
                    {...register('city')}
                    placeholder='مثلاً: دمشق'
                    className={inputClass}
                    disabled={submitting}
                  />
                  {errors.city?.message ? (
                    <div className='mt-2 text-right font-cairo text-[11px] font-semibold text-[#E11D48]'>
                      {errors.city.message}
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className={labelClass}>
                    نوع المنشأة{' '}
                    <span className='font-normal text-[#98A2B3]'>(اختياري)</span>
                  </div>
                  <Controller
                    name='facilityType'
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        options={typeOptions.map((t) => ({
                          value: t.value,
                          label: t.label,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder='اختر نوع المنشأة...'
                        emptyTriggerLabel='لم يتم الاختيار'
                        emptyState='لا توجد أنواع متاحة.'
                        listboxAriaLabel='اختيار نوع المنشأة'
                        disabled={submitting}
                      />
                    )}
                  />
                </div>

                <div>
                  <div className={labelClass}>
                    العنوان{' '}
                    <span className='font-normal text-[#98A2B3]'>(اختياري)</span>
                  </div>
                  <input
                    type='text'
                    {...register('address')}
                    placeholder='مثلاً: شارع بغداد، المزة'
                    className={inputClass}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <div className={labelClass}>
                    رقم الهاتف{' '}
                    <span className='font-normal text-[#98A2B3]'>(اختياري)</span>
                  </div>
                  <input
                    type='tel'
                    {...register('phone')}
                    placeholder='مثلاً: +963 11 1234567'
                    className={inputClass}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <div className={labelClass}>
                    وصف إضافي{' '}
                    <span className='font-normal text-[#98A2B3]'>(اختياري)</span>
                  </div>
                  <textarea
                    {...register('description')}
                    placeholder='أضف أي ملاحظات أو تفاصيل إضافية...'
                    className='min-h-[104px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-[#0F8F8B] focus:ring-opacity-20'
                    disabled={submitting}
                  />
                </div>

                <div className='mt-1 flex items-center justify-between gap-4'>
                  <motion.button
                    type='button'
                    onClick={handleClose}
                    disabled={submitting}
                    className='flex h-[48px] flex-1 items-center justify-center rounded-[6px] bg-[#F2F4F7] font-cairo text-[13px] font-extrabold text-[#667085] disabled:cursor-not-allowed disabled:opacity-50'
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                  >
                    إلغاء
                  </motion.button>

                  <motion.button
                    type='submit'
                    disabled={submitting}
                    className='flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#F79009] font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(247,144,9,0.30)] disabled:cursor-not-allowed disabled:opacity-50'
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                  >
                    <Send className='h-4 w-4' />
                    إرسال الاقتراح
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
