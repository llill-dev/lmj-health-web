'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import type { FacilityType } from '@/lib/admin/types';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

function buildSuggestFacilitySchema(tr: TrFn = defaultTr) {
  return z.object({
    name: z.string().min(2, tr('اسم المنشأة مطلوب', 'The facility name is required')),
    city: z.string().min(2, tr('المدينة مطلوبة', 'The city is required')),
    facilityType: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
  });
}

type SuggestFacilityValues = z.infer<ReturnType<typeof buildSuggestFacilitySchema>>;

export type SuggestFacilityPayload = {
  name: string;
  city: string;
  facilityType?: FacilityType;
  address?: string;
  phone?: string;
  description?: string;
};

const EMPTY_SUGGEST_FACILITY_FORM: SuggestFacilityValues = {
  name: '',
  city: '',
  facilityType: '',
  address: '',
  phone: '',
  description: '',
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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const suggestFacilitySchema = useMemo(
    () => buildSuggestFacilitySchema(tr),
    [locale],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuggestFacilityValues>({
    resolver: zodResolver(suggestFacilitySchema),
    defaultValues: EMPTY_SUGGEST_FACILITY_FORM,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) return;
    reset(EMPTY_SUGGEST_FACILITY_FORM);
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, submitting]);

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={tr('اقتراح منشأة', 'Suggest a facility')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) handleClose();
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[760px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={tr('إغلاق', 'Close')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {tr('اقتراح منشأة', 'Suggest a facility')}
                </h2>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit(submit)}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <p className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-4 text-start font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
                    {tr(
                      'إذا لم تجد المنشأة في القائمة، أرسل اقتراحاً وسيتم مراجعته وإضافته إلى النظام بعد الموافقة.',
                      'If you cannot find the facility in the list, send a suggestion and it will be reviewed and added to the system after approval.',
                    )}
                  </p>

                  <DoctorProfileFormField
                    label={tr('اسم المنشأة', 'Facility name')}
                    required
                    error={errors.name?.message}
                  >
                    <input
                      {...register('name')}
                      placeholder={tr('أدخل اسم المنشأة', 'Enter the facility name')}
                      disabled={submitting}
                      className={profileFieldClass(
                        cn(profileInputClass, 'text-start placeholder:text-start'),
                        Boolean(errors.name),
                      )}
                    />
                  </DoctorProfileFormField>

                  <DoctorProfileFormField
                    label={tr('نوع المنشأة', 'Facility type')}
                    hint={tr('اختياري', 'optional')}
                  >
                    <Controller
                      control={control}
                      name="facilityType"
                      render={({ field }) => (
                        <StyledSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={typeOptions.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                          placeholder={tr('اختر نوع المنشأة', 'Select the facility type')}
                          disabled={submitting}
                        />
                      )}
                    />
                  </DoctorProfileFormField>

                  <DoctorProfileFormField
                    label={tr('الوصف', 'Description')}
                    hint={tr('اختياري', 'optional')}
                    error={errors.description?.message}
                  >
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder={tr('أدخل وصف المنشأة أو أي ملاحظات إضافية', 'Enter the facility description or any additional notes')}
                      disabled={submitting}
                      className={profileFieldClass(
                        cn(profileTextareaClass, 'text-start placeholder:text-start'),
                        Boolean(errors.description),
                      )}
                    />
                  </DoctorProfileFormField>

                  <div>
                    <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                      {tr('الموقع', 'Location')}
                    </h3>
                    <div className="space-y-4">
                      <DoctorProfileFormField
                        label={tr('المدينة', 'City')}
                        required
                        error={errors.city?.message}
                      >
                        <input
                          {...register('city')}
                          placeholder={tr('أدخل المدينة', 'Enter the city')}
                          disabled={submitting}
                          className={profileFieldClass(
                            cn(profileInputClass, 'text-start placeholder:text-start'),
                            Boolean(errors.city),
                          )}
                        />
                      </DoctorProfileFormField>

                      <DoctorProfileFormField
                        label={tr('العنوان', 'Address')}
                        hint={tr('اختياري', 'optional')}
                        error={errors.address?.message}
                      >
                        <input
                          {...register('address')}
                          placeholder={tr('أدخل العنوان التفصيلي', 'Enter the detailed address')}
                          disabled={submitting}
                          className={profileFieldClass(
                            cn(profileInputClass, 'text-start placeholder:text-start'),
                            Boolean(errors.address),
                          )}
                        />
                      </DoctorProfileFormField>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                      {tr('التواصل', 'Contact')}
                    </h3>
                    <DoctorProfileFormField
                      label={tr('الهاتف', 'Phone')}
                      hint={tr('اختياري', 'optional')}
                      error={errors.phone?.message}
                    >
                      <input
                        {...register('phone')}
                        placeholder="09xxxxxxxx"
                        dir="ltr"
                        disabled={submitting}
                        className={profileFieldClass(
                          cn(profileInputClass, 'text-start placeholder:text-start'),
                          Boolean(errors.phone),
                        )}
                      />
                    </DoctorProfileFormField>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  {tr('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {submitting ? tr('جارٍ الإرسال…', 'Sending…') : tr('إرسال الاقتراح', 'Send suggestion')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
