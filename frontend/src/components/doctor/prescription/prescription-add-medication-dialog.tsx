'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DoctorProfileFormField,
  profileInputClass,
  profileFieldClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import type { PrescriptionDraftForm } from './prescription-types';
import { useI18n } from '@/i18n/provider';

function buildSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(1, t('doctor.medicationDialog.nameRequired')),
    dosage: z.string().trim().min(1, t('doctor.medicationDialog.dosageRequired')),
    frequency: z
      .string()
      .trim()
      .min(1, t('doctor.medicationDialog.frequencyRequired')),
    duration: z
      .string()
      .trim()
      .min(1, t('doctor.medicationDialog.durationRequired')),
  });
}

export default function PrescriptionAddMedicationDialog({
  open,
  onOpenChange,
  initialValues,
  title,
  confirmLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: PrescriptionDraftForm;
  title: string;
  confirmLabel: string;
  onSubmit: (values: PrescriptionDraftForm) => void | Promise<void>;
}) {
  const { locale, dir, t } = useI18n();
  const form = useForm<PrescriptionDraftForm>({
    resolver: zodResolver(buildSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      initialValues ?? {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
      },
    );
  }, [open, initialValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      // يبقى الحوار مفتوحاً لعرض أخطاء الحقول أو إعادة المحاولة
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content
          dir={dir}
          lang={locale}
          className="fixed left-1/2 top-1/2 z-[9999] w-[min(520px,calc(100vw-32px))] max-h-[calc(100vh-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-[#E4E7EC] bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.18)] sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <Dialog.Title className="font-cairo text-[18px] font-extrabold text-[#101828]">
              {title}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {locale === 'ar'
                ? 'نموذج لإدخال بيانات دواء ضمن الوصفة الطبية.'
                : 'A form to enter medication details for the prescription.'}
            </Dialog.Description>
            <Dialog.Close
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#667085] hover:bg-[#F2F4F7]"
              aria-label={t('doctor.medicationDialog.closeAria')}
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <DoctorProfileFormField
              label={t('doctor.medicationDialog.nameLabel')}
              required
              error={form.formState.errors.name?.message}
            >
              <input
                {...form.register('name')}
                className={profileFieldClass(
                  profileInputClass,
                  Boolean(form.formState.errors.name),
                )}
              />
            </DoctorProfileFormField>

            <DoctorProfileFormField
              label={t('doctor.medicationCard.dosageLabel')}
              required
              error={form.formState.errors.dosage?.message}
            >
              <input
                {...form.register('dosage')}
                className={profileFieldClass(
                  profileInputClass,
                  Boolean(form.formState.errors.dosage),
                )}
              />
            </DoctorProfileFormField>

            <DoctorProfileFormField
              label={t('doctor.medicationCard.frequencyLabel')}
              required
              error={form.formState.errors.frequency?.message}
            >
              <input
                {...form.register('frequency')}
                className={profileFieldClass(
                  profileInputClass,
                  Boolean(form.formState.errors.frequency),
                )}
              />
            </DoctorProfileFormField>

            <DoctorProfileFormField
              label={t('doctor.medicationCard.durationLabel')}
              required
              error={form.formState.errors.duration?.message}
            >
              <input
                {...form.register('duration')}
                className={profileFieldClass(
                  profileInputClass,
                  Boolean(form.formState.errors.duration),
                )}
              />
            </DoctorProfileFormField>

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)]"
            >
              {confirmLabel}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
