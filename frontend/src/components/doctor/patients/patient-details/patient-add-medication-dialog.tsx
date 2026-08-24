'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import type { AddDoctorPatientMedicationBody } from '@/lib/doctor/types';
import { useI18n } from '@/i18n/provider';

const schema = z.object({
  name: z.string().trim().min(1, 'required'),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().trim().optional(),
  remindersEnabled: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PatientAddMedicationDialog({
  open,
  onOpenChange,
  onSubmit,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddDoctorPatientMedicationBody) => void | Promise<void>;
  busy?: boolean;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      notes: '',
      remindersEnabled: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      notes: '',
      remindersEnabled: false,
    });
  }, [open, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      dosage: values.dosage?.trim() || undefined,
      frequency: values.frequency?.trim() || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      notes: values.notes?.trim() || undefined,
      remindersEnabled: values.remindersEnabled || undefined,
    });
    onOpenChange(false);
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content
          dir={dir}
          lang={locale}
          className="fixed start-1/2 top-1/2 z-[9999] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[#E4E7EC] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <Dialog.Title className="font-cairo text-[18px] font-extrabold text-[#101828]">
              {tr('إضافة دواء للمريض', 'Add patient medication')}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#667085] hover:bg-[#F2F4F7]"
              aria-label={tr('إغلاق', 'Close')}
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <DoctorProfileFormField
              label={tr('اسم الدواء', 'Medication name')}
              required
              error={
                form.formState.errors.name
                  ? tr('اسم الدواء مطلوب', 'Medication name is required')
                  : undefined
              }
            >
              <input
                {...form.register('name')}
                className={profileFieldClass(
                  profileInputClass,
                  Boolean(form.formState.errors.name),
                )}
              />
            </DoctorProfileFormField>

            <div className="grid grid-cols-2 gap-3">
              <DoctorProfileFormField label={tr('الجرعة', 'Dosage')}>
                <input {...form.register('dosage')} className={profileInputClass} />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={tr('التكرار', 'Frequency')}>
                <input {...form.register('frequency')} className={profileInputClass} />
              </DoctorProfileFormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DoctorProfileFormField label={tr('تاريخ البدء', 'Start date')}>
                <input type="date" {...form.register('startDate')} className={profileInputClass} />
              </DoctorProfileFormField>
              <DoctorProfileFormField label={tr('تاريخ الانتهاء', 'End date')}>
                <input type="date" {...form.register('endDate')} className={profileInputClass} />
              </DoctorProfileFormField>
            </div>

            <DoctorProfileFormField label={tr('ملاحظات', 'Notes')}>
              <textarea
                {...form.register('notes')}
                rows={3}
                className={`${profileInputClass} min-h-[88px] resize-y`}
              />
            </DoctorProfileFormField>

            <label className="flex items-center justify-end gap-2 font-cairo text-[13px] font-semibold text-[#344054]">
              <input type="checkbox" {...form.register('remindersEnabled')} />
              {tr('تفعيل التذكيرات', 'Enable reminders')}
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
            >
              {busy
                ? tr('جارٍ الحفظ...', 'Saving...')
                : tr('حفظ الدواء', 'Save medication')}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
