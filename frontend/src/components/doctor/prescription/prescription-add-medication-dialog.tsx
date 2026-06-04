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

const schema = z.object({
  name: z.string().trim().min(1, 'اسم الدواء مطلوب'),
  dosage: z.string().trim().min(1, 'الجرعة مطلوبة'),
  frequency: z.string().trim().min(1, 'التكرار مطلوب'),
  duration: z.string().trim().min(1, 'المدة مطلوبة'),
});

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
  const form = useForm<PrescriptionDraftForm>({
    resolver: zodResolver(schema),
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
          dir="rtl"
          lang="ar"
          className="fixed left-1/2 top-1/2 z-[9999] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[#E4E7EC] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <Dialog.Title className="font-cairo text-[18px] font-extrabold text-[#101828]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#667085] hover:bg-[#F2F4F7]"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <DoctorProfileFormField
              label="اسم الدواء"
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
              label="الجرعة"
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
              label="التكرار"
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
              label="المدة"
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
