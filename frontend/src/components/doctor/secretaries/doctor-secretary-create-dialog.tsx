'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { DoctorSecretaryFormFields } from '@/components/doctor/secretaries/doctor-secretary-form-fields';
import {
  toastSecretaryValidationErrors,
  toSecretaryFormFieldErrors,
} from '@/components/doctor/secretaries/secretary-form-validation';
import { useToast } from '@/components/ui/ToastProvider';
import {
  DEFAULT_SECRETARY_CREATE_FORM,
  buildDoctorSecretaryCreateFormSchema,
  MAX_DOCTOR_SECRETARIES,
  type DoctorSecretaryCreateFormValues,
} from '@/lib/doctor/secretaries/schema';
import { useI18n } from '@/i18n/provider';

export function DoctorSecretaryCreateDialog({
  open,
  saving,
  secretaryCount = 0,
  onClose,
  onSave,
}: {
  open: boolean;
  saving?: boolean;
  secretaryCount?: number;
  onClose: () => void;
  onSave: (input: DoctorSecretaryCreateFormValues) => Promise<void> | void;
}) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<DoctorSecretaryCreateFormValues>({
    resolver: zodResolver(buildDoctorSecretaryCreateFormSchema(t)),
    defaultValues: DEFAULT_SECRETARY_CREATE_FORM,
    mode: 'onSubmit',
  });

  const values = watch();
  const fieldErrors = toSecretaryFormFieldErrors(errors);
  const atSecretaryLimit = secretaryCount >= MAX_DOCTOR_SECRETARIES;

  const closeDialog = () => {
    reset(DEFAULT_SECRETARY_CREATE_FORM);
    setShowPassword(false);
    onClose();
  };

  const setFieldValue = <K extends keyof DoctorSecretaryCreateFormValues>(
    field: K,
    value: DoctorSecretaryCreateFormValues[K],
  ) => {
    setValue(field, value as any, { shouldDirty: true });
    clearErrors(field);
  };

  const togglePermission = (key: string) => {
    const next = values.permissions.includes(key)
      ? values.permissions.filter((item) => item !== key)
      : [...values.permissions, key];
    setFieldValue('permissions', next);
  };

  const submit = handleSubmit(
    async (formValues) => {
      await onSave(formValues);
      reset(DEFAULT_SECRETARY_CREATE_FORM);
      setShowPassword(false);
    },
    (validationErrors) => {
      toastSecretaryValidationErrors(toast, validationErrors);
    },
  );

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={closeDialog}
      title={t('doctor.secretaryDialog.createTitle')}
      maxWidthClass="max-w-[640px]"
    >
      {atSecretaryLimit ? (
        <div
          className="mb-4 rounded-[8px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B42318]"
          role="alert"
        >
          {t('doctor.secretaryDialog.limitReached').replace(
            '{max}',
            String(MAX_DOCTOR_SECRETARIES),
          )}
        </div>
      ) : null}

      <DoctorSecretaryFormFields
        mode="create"
        fullName={values.fullName}
        onFullNameChange={(value) => setFieldValue('fullName', value)}
        email={values.email}
        onEmailChange={(value) => setFieldValue('email', value)}
        password={values.password}
        onPasswordChange={(value) => setFieldValue('password', value)}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((value) => !value)}
        phone={values.phone}
        onPhoneChange={(value) => setFieldValue('phone', value)}
        gender={values.gender}
        onGenderChange={(value) => setFieldValue('gender', value)}
        permissions={values.permissions}
        onTogglePermission={togglePermission}
        fieldErrors={fieldErrors}
      />

      <button
        type="button"
        disabled={saving || atSecretaryLimit}
        title={
          atSecretaryLimit
            ? t('doctor.secretaryDialog.limitTitle').replace(
                '{max}',
                String(MAX_DOCTOR_SECRETARIES),
              )
            : undefined
        }
        onClick={() => void submit()}
        className="mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? t('doctor.secretaryDialog.creating')
          : t('doctor.secretaryDialog.create')}
      </button>
    </ClinicAccountsModalShell>
  );
}
