'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, X, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import StyledSelect from '@/components/ui/styled-select';
import {
  doctorFacilityToFormValues,
} from '@/lib/doctor/facilities/mappers';
import {
  buildDoctorFacilityFormSchema,
  buildEmptyDoctorFacilityForm,
  type DoctorFacilityFormSchemaValues,
} from '@/lib/doctor/facilities/schema';
import type { DoctorFacility } from '@/lib/doctor/facilities/types';
import { getFacilityTypeOptions } from '@/lib/doctor/facilities/types';
import { FacilityStatusBadge } from '@/components/doctor/facilities/facility-status-badge';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function FacilityFormDialog({
  open,
  mode,
  initialFacility,
  typeOptions,
  submitting = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initialFacility?: DoctorFacility | null;
  typeOptions?: Array<{ value: DoctorFacility['facilityType']; label: string }>;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: DoctorFacilityFormSchemaValues) => void | Promise<void>;
}) {
  const { dir, t, locale } = useI18n();
  const resolvedTypeOptions = typeOptions ?? getFacilityTypeOptions(t);
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DoctorFacilityFormSchemaValues>({
    resolver: zodResolver(buildDoctorFacilityFormSchema(t)),
    defaultValues: buildEmptyDoctorFacilityForm(locale),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) return;
    reset(
      mode === 'edit' && initialFacility
        ? doctorFacilityToFormValues(initialFacility)
        : buildEmptyDoctorFacilityForm(locale),
    );
  }, [open, mode, initialFacility, reset, locale]);

  const [attrInput, setAttrInput] = useState('');
  const attributes = watch('attributes') ?? [];

  useEffect(() => {
    if (!open) setAttrInput('');
  }, [open]);

  const addAttribute = () => {
    const key = attrInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key) return;
    const next = [...new Set([...attributes, key])];
    setValue('attributes', next, { shouldDirty: true });
    setAttrInput('');
  };

  const removeAttribute = (key: string) => {
    setValue(
      'attributes',
      attributes.filter((item) => item !== key),
      { shouldDirty: true },
    );
  };

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

  const title =
    mode === 'edit'
      ? t('doctor.facilityFormDialog.titleEdit')
      : t('doctor.facilityFormDialog.titleCreate');

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
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
                onClick={onClose}
                disabled={submitting}
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {title}
                </h2>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                <DoctorProfileFormField
                  label={t('doctor.facilityForm.fields.name.label')}
                  required
                  error={errors.name?.message}
                >
                  <input
                    {...register('name')}
                    placeholder={t('doctor.facilityForm.fields.name.placeholder')}
                    className={profileFieldClass(
                      cn(profileInputClass, 'text-start placeholder:text-start'),
                      Boolean(errors.name),
                    )}
                  />
                </DoctorProfileFormField>

                <DoctorProfileFormField
                  label={t('doctor.facilityForm.fields.type.label')}
                  required
                  error={errors.facilityType?.message}
                >
                  <Controller
                    control={control}
                    name="facilityType"
                    render={({ field }) => (
                      <StyledSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={resolvedTypeOptions.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        placeholder={t('doctor.facilityForm.fields.type.placeholder')}
                        error={Boolean(errors.facilityType)}
                      />
                    )}
                  />
                </DoctorProfileFormField>

                <DoctorProfileFormField
                  label={t('common.description')}
                  error={errors.description?.message}
                >
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder={t('doctor.facilityForm.fields.description.placeholder')}
                    className={profileFieldClass(
                      cn(profileTextareaClass, 'text-start placeholder:text-start'),
                      Boolean(errors.description),
                    )}
                  />
                </DoctorProfileFormField>

                <div>
                  <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                    {t('doctor.facilityForm.sections.location')}
                  </h3>
                  <div className="space-y-4">
                    <DoctorProfileFormField
                      label={t('common.city')}
                      required
                      error={errors.city?.message}
                    >
                      <input
                        {...register('city')}
                        placeholder={t('doctor.facilityForm.fields.city.placeholder')}
                        className={profileFieldClass(
                          cn(profileInputClass, 'text-start placeholder:text-start'),
                          Boolean(errors.city),
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField
                      label={t('common.country')}
                      required
                      error={errors.country?.message}
                    >
                      <input
                        {...register('country')}
                        placeholder={t('doctor.facilityForm.fields.country.placeholder')}
                        className={profileFieldClass(
                          cn(profileInputClass, 'text-start placeholder:text-start'),
                          Boolean(errors.country),
                        )}
                      />
                    </DoctorProfileFormField>

                    <DoctorProfileFormField
                      label={t('common.address')}
                      required
                      error={errors.address?.message}
                    >
                      <input
                        {...register('address')}
                        placeholder={t('doctor.facilityForm.fields.address.placeholder')}
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
                    {t('doctor.facilityForm.sections.contact')}
                  </h3>
                  <DoctorProfileFormField
                    label={t('common.phone')}
                    required
                    error={errors.phone?.message}
                  >
                    <input
                      {...register('phone')}
                      placeholder="09xxxxxxxx"
                      dir={dir}
                      className={profileFieldClass(
                        cn(profileInputClass, 'text-start placeholder:text-start'),
                        Boolean(errors.phone),
                      )}
                    />
                  </DoctorProfileFormField>
                </div>

                {mode === 'edit' ? (
                  <div>
                    <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
                      {t('doctor.facilityForm.attributes.title')}
                    </h3>
                    <DoctorProfileFormField
                      label={t('doctor.facilityForm.attributes.addLabel')}
                      hint={t('doctor.facilityForm.attributes.addHint')}
                    >
                      <div className="flex gap-2 items-center">
                        <input
                          value={attrInput}
                          onChange={(event) => setAttrInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addAttribute();
                            }
                          }}
                          placeholder="Night Shift"
                          disabled={submitting}
                          className={profileFieldClass(
                            cn(profileInputClass, 'text-start placeholder:text-start'),
                            false,
                          )}
                        />
                        <button
                          type="button"
                          onClick={addAttribute}
                          disabled={submitting || !attrInput.trim()}
                          className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white disabled:opacity-50"
                          aria-label={t('doctor.facilityForm.attributes.addLabel')}
                        >
                          <Plus className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </DoctorProfileFormField>
                    {attributes.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {attributes.map((attr) => (
                          <span
                            key={attr}
                            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E6F4F3] px-3 py-1 font-cairo text-[11px] font-bold text-primary"
                          >
                            {formatFacilityAttributeLabel(attr)}
                            <button
                              type="button"
                              onClick={() => removeAttribute(attr)}
                              disabled={submitting}
                              className="text-primary/70 transition hover:text-[#B42318] disabled:opacity-50"
                              aria-label={t('doctor.facilityForm.attributes.removeAria').replace('{attr}', attr)}
                            >
                              <Trash2 className="w-3 h-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        {t('doctor.facilityForm.attributes.empty')}
                      </p>
                    )}
                  </div>
                ) : null}

                {mode === 'edit' && initialFacility ? (
                  <div className="flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-4">
                    <FacilityStatusBadge status={initialFacility.status} />
                    <span className="font-cairo text-[13px] font-extrabold text-[#667085]">
                      {t('doctor.facilityForm.status.label')}
                    </span>
                  </div>
                ) : (
                  <p className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-4 text-start font-cairo text-[12px] font-semibold text-[#667085]">
                    {t('doctor.facilityForm.postCreateNote')}
                  </p>
                )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {submitting ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
