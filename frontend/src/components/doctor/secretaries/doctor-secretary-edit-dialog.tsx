'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { DoctorSecretaryFormFields } from '@/components/doctor/secretaries/doctor-secretary-form-fields';
import {
  toastSecretaryValidationErrors,
  toSecretaryFormFieldErrors,
} from '@/components/doctor/secretaries/secretary-form-validation';
import { useToast } from '@/components/ui/ToastProvider';
import {
  doctorSecretariesApi,
  doctorSecretariesQueryKeys,
} from '@/lib/doctor/secretaries/client';
import {
  getSecretaryId,
  resolveSecretaryFormValues,
} from '@/lib/doctor/secretaries/formUtils';
import {
  doctorSecretaryEditFormSchema,
  type DoctorSecretaryEditFormValues,
} from '@/lib/doctor/secretaries/schema';
import type { DoctorSecretary } from '@/lib/doctor/secretaries/types';

function buildEditFormValues(
  secretary: DoctorSecretary,
): DoctorSecretaryEditFormValues {
  const values = resolveSecretaryFormValues(secretary);
  return {
    fullName: values.fullName,
    phone: values.phone,
    gender: values.gender,
    permissions: values.permissions,
  };
}

function DoctorSecretaryEditForm({
  secretary,
  saving,
  onSave,
}: {
  secretary: DoctorSecretary;
  saving?: boolean;
  onSave: (input: DoctorSecretaryEditFormValues) => Promise<void> | void;
}) {
  const { toast } = useToast();
  const secretaryId = getSecretaryId(secretary)!;
  const initialValues = useMemo(
    () => buildEditFormValues(secretary),
    [secretary],
  );

  const detailQuery = useQuery({
    queryKey: doctorSecretariesQueryKeys.detail(secretaryId),
    queryFn: () => doctorSecretariesApi.get(secretaryId),
    staleTime: 0,
  });

  const resolvedSecretary = detailQuery.data ?? secretary;
  const displayEmail =
    resolveSecretaryFormValues(resolvedSecretary).email || '—';

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<DoctorSecretaryEditFormValues>({
    resolver: zodResolver(doctorSecretaryEditFormSchema),
    defaultValues: initialValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset(buildEditFormValues(secretary));
  }, [secretary, reset]);

  useEffect(() => {
    if (!detailQuery.data) return;
    reset(buildEditFormValues(detailQuery.data));
  }, [detailQuery.data, reset]);

  const values = watch();
  const fieldErrors = toSecretaryFormFieldErrors(errors);

  const setFieldValue = <K extends keyof DoctorSecretaryEditFormValues>(
    field: K,
    value: DoctorSecretaryEditFormValues[K],
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
    },
    (validationErrors) => {
      toastSecretaryValidationErrors(toast, validationErrors);
    },
  );

  return (
    <>
      <DoctorSecretaryFormFields
        mode="edit"
        fullName={values.fullName}
        onFullNameChange={(value) => setFieldValue('fullName', value)}
        email={displayEmail}
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
        disabled={saving}
        onClick={() => void submit()}
        className="mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
      >
        {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
      </button>
    </>
  );
}

export function DoctorSecretaryEditDialog({
  open,
  secretary,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  secretary: DoctorSecretary | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: DoctorSecretaryEditFormValues) => Promise<void> | void;
}) {
  const secretaryId = getSecretaryId(secretary);

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="تعديل السكرتير"
      maxWidthClass="max-w-[640px]"
    >
      {open && secretary && secretaryId ? (
        <DoctorSecretaryEditForm
          key={secretaryId}
          secretary={secretary}
          saving={saving}
          onSave={onSave}
        />
      ) : null}
    </ClinicAccountsModalShell>
  );
}
