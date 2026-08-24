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
import { useI18n } from '@/i18n/provider';

type TFn = (key: string, fallback?: string) => string;

function buildProfileEditSchema(t: TFn) {
  return z.object({
    fullName: z.string().trim().min(1, t('doctor.profileEditDialog.errors.fullNameRequired')),
    phone: z
      .string()
      .trim()
      .min(1, t('doctor.profileEditDialog.errors.phoneRequired'))
      .refine(
        (value) => /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, '')),
        t('doctor.profileEditDialog.errors.phoneInvalid'),
      ),
    address: z.string().trim().min(1, t('doctor.profileEditDialog.errors.addressRequired')),
    bio: z
      .string()
      .trim()
      .min(10, t('doctor.profileEditDialog.errors.bioTooShort'))
      .max(1000, t('doctor.profileEditDialog.errors.bioTooLong')),
    consultationFee: z
      .string()
      .trim()
      .min(1, t('doctor.profileEditDialog.errors.feeRequired'))
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
        message: t('doctor.profileEditDialog.errors.feeInvalid'),
      }),
  });
}

type ProfileEditForm = z.infer<ReturnType<typeof buildProfileEditSchema>>;

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
  const { locale, t } = useI18n();
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

  const profileEditSchema = useMemo(() => buildProfileEditSchema(t), [locale]);

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
      label: t('doctor.profileEditDialog.fields.fullName.label'),
      placeholder: t('doctor.profileEditDialog.fields.fullName.placeholder'),
      type: 'text',
      autoComplete: 'name',
    },
    {
      name: 'phone',
      label: t('doctor.profileEditDialog.fields.phone.label'),
      placeholder: '+9639XXXXXXXX',
      type: 'tel',
      autoComplete: 'tel',
    },
    {
      name: 'address',
      label: t('doctor.profileEditDialog.fields.address.label'),
      placeholder: t('doctor.profileEditDialog.fields.address.placeholder'),
      type: 'text',
    },
    {
      name: 'bio',
      label: t('doctor.profileEditDialog.fields.bio.label'),
      placeholder: t('doctor.profileEditDialog.fields.bio.placeholder'),
      type: 'text',
      multiline: true,
      hint: t('doctor.profileEditDialog.fields.bio.hint'),
    },
    {
      name: 'consultationFee',
      label: t('doctor.profileEditDialog.fields.consultationFee.label'),
      placeholder: '200',
      type: 'text',
    },
  ];

  return (
    <DoctorSecurityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('doctor.profileEditDialog.title')}
      description={t('doctor.profileEditDialog.description')}
      icon={UserRound}
      form={form}
      fields={fields}
      submitLabel={t('doctor.profileEditDialog.submitLabel')}
      busy={busy}
      onValidatedSubmit={async (values) => {
        try {
          await onSubmit(values);
          onOpenChange(false);
        } catch (error) {
          toast(getUserFacingRequestErrorMessage(error), {
            title: t('doctor.profileEditDialog.saveFailedTitle'),
            variant: 'error',
          });
          throw error;
        }
      }}
    />
  );
}

export type { ProfileEditForm };
