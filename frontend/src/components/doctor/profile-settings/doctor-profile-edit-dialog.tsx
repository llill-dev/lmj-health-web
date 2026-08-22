'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DoctorSecurityFormDialog, {
  type SecurityFormFieldConfig,
} from '@/components/doctor/profile-settings/doctor-security-form-dialog';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { DoctorProfileRecord } from '@/lib/doctor/profile/profileClient';

const profileEditSchema = z.object({
  fullName: z.string().trim().min(1, 'الاسم الكامل مطلوب'),
  phone: z
    .string()
    .trim()
    .min(1, 'رقم الهاتف مطلوب')
    .refine(
      (value) => /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, '')),
      'أدخل رقم هاتف صالحاً مع رمز الدولة',
    ),
  address: z.string().trim().min(1, 'العنوان مطلوب'),
  bio: z
    .string()
    .trim()
    .min(10, 'النبذة قصيرة جداً (10 أحرف على الأقل)')
    .max(1000, 'النبذة طويلة جداً'),
  consultationFee: z
    .string()
    .trim()
    .min(1, 'رسوم الاستشارة مطلوبة')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'أدخل رسوماً صالحة (0 أو أكثر)',
    }),
});

type ProfileEditForm = z.infer<typeof profileEditSchema>;

export default function DoctorProfileEditDialog({
  open,
  onOpenChange,
  doctor,
  busy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: DoctorProfileRecord | null | undefined;
  busy?: boolean;
  onSubmit: (values: ProfileEditForm) => Promise<void>;
}) {
  const { toast } = useToast();
  const user = doctor?.user;

  const defaultValues = useMemo<ProfileEditForm>(
    () => ({
      fullName: user?.fullName?.trim() ?? '',
      phone: user?.phone?.trim() ?? '',
      address: user?.address?.trim() ?? '',
      bio: doctor?.bio?.trim() ?? '',
      consultationFee:
        doctor?.consultationFee != null ? String(doctor.consultationFee) : '',
    }),
    [doctor?.bio, doctor?.consultationFee, user],
  );

  const form = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onTouched',
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, defaultValues, form]);

  const fields: SecurityFormFieldConfig<ProfileEditForm>[] = [
    {
      name: 'fullName',
      label: 'الاسم الكامل',
      placeholder: 'د. اسم الطبيب',
      type: 'text',
      autoComplete: 'name',
    },
    {
      name: 'phone',
      label: 'رقم الهاتف',
      placeholder: '+9639XXXXXXXX',
      type: 'tel',
      autoComplete: 'tel',
    },
    {
      name: 'address',
      label: 'العنوان',
      placeholder: 'المدينة، الشارع',
      type: 'text',
    },
    {
      name: 'bio',
      label: 'نبذة عن الطبيب',
      placeholder: 'اكتب نبذة مختصرة عن خبرتك وتخصصك',
      type: 'text',
      multiline: true,
      hint: '10–1000 حرف',
    },
    {
      name: 'consultationFee',
      label: 'رسوم الاستشارة',
      placeholder: '200',
      type: 'text',
    },
  ];

  return (
    <DoctorSecurityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تعديل الملف الشخصي"
      description="يمكنك تحديث البيانات غير الحساسة مباشرة. التخصص والرقم المهني والعنوان الطبي يتطلبون طلب تغيير منفصل."
      icon={UserRound}
      form={form}
      fields={fields}
      submitLabel="حفظ التعديلات"
      busy={busy}
      onValidatedSubmit={async (values) => {
        try {
          await onSubmit(values);
          onOpenChange(false);
        } catch (error) {
          toast(getUserFacingRequestErrorMessage(error), {
            title: 'تعذّر حفظ الملف',
            variant: 'error',
          });
          throw error;
        }
      }}
    />
  );
}

export type { ProfileEditForm };
