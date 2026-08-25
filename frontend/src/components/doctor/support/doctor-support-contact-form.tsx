'use client';

import { Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  DoctorProfileFormField,
  profileFieldClass,
  profileInputClass,
  profileTextareaClass,
} from '@/components/doctor/profile-settings/doctor-profile-form-field';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import { submitDoctorSupportRequest } from '@/lib/doctor/support/submitDoctorSupportRequest';
import type {
  DoctorSupportContactForm,
  DoctorSupportIdentity,
  DoctorSupportRequestType,
} from '@/lib/doctor/support/types';
import { useI18n } from '@/i18n/provider';

type TFn = (key: string, fallback?: string) => string;

function buildRequestTypes(
  t: TFn,
): Array<{ value: DoctorSupportRequestType; label: string }> {
  return [
    { value: 'technical', label: t('doctor.supportContactForm.requestType.technical') },
    { value: 'account', label: t('doctor.supportContactForm.requestType.account') },
    { value: 'billing', label: t('doctor.supportContactForm.requestType.billing') },
    { value: 'verification', label: t('doctor.supportContactForm.requestType.verification') },
    { value: 'other', label: t('doctor.supportContactForm.requestType.other') },
  ];
}

const EMPTY_FORM: DoctorSupportContactForm = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  requestType: 'technical',
};

export function DoctorSupportContactForm({
  identity,
  supportEmail,
  loadingIdentity,
}: {
  identity: DoctorSupportIdentity;
  supportEmail: string;
  loadingIdentity?: boolean;
}) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DoctorSupportContactForm>(EMPTY_FORM);

  const requestTypeOptions = useMemo(
    () =>
      buildRequestTypes(t).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [locale],
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: identity.fullName?.trim() || prev.fullName,
      email: identity.email?.trim() || prev.email,
      phone: identity.phone?.trim() || prev.phone,
    }));
  }, [identity.email, identity.fullName, identity.phone]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.message.trim()) {
      toast(t('doctor.supportContactForm.missingFieldsToast'), {
        title: t('doctor.supportContactForm.missingFieldsTitle'),
        variant: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      submitDoctorSupportRequest({
        form,
        identity,
        supportEmail,
      });

      toast(t('doctor.supportContactForm.openMailToast'), {
        title: t('doctor.supportContactForm.openMailTitle'),
        variant: 'success',
      });
      setForm((prev) => ({
        ...EMPTY_FORM,
        fullName: prev.fullName,
        email: prev.email,
        phone: prev.phone,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      dir={dir}
      lang={locale}
      className="space-y-4 text-start"
    >
      <div className="rounded-[12px] border border-[#E0F2FE] bg-[#F0F9FF] px-4 py-3">
        <p className="font-cairo text-[12px] font-semibold leading-[20px] text-[#0369A1]">
          {t('doctor.supportContactForm.infoBanner')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DoctorProfileFormField label={t('doctor.supportContactForm.fields.requestType.label')}>
          <StyledSelect
            size="md"
            tone="muted"
            disabled={submitting || loadingIdentity}
            value={form.requestType}
            onChange={(next) =>
              setForm((prev) => ({
                ...prev,
                requestType: next as DoctorSupportRequestType,
              }))
            }
            options={requestTypeOptions}
            placeholder={t('doctor.supportContactForm.fields.requestType.placeholder')}
            listboxAriaLabel={t('doctor.supportContactForm.fields.requestType.label')}
            triggerClassName={profileFieldClass('w-full', false)}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label={t('doctor.supportContactForm.fields.subject.label')}>
          <input
            value={form.subject}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, subject: event.target.value }))
            }
            placeholder={t('doctor.supportContactForm.fields.subject.placeholder')}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DoctorProfileFormField label={t('doctor.profileEditDialog.fields.fullName.label')}>
          <input
            value={form.fullName}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            placeholder={t('doctor.supportContactForm.fields.fullName.placeholder')}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.supportContactForm.fields.email.label')}>
          <input
            type="email"
            value={form.email}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="example@email.com"
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={t('doctor.supportContactForm.fields.phone.label')}>
          <input
            type="tel"
            value={form.phone}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="+963 9XX XXX XXX"
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
      </div>

      <DoctorProfileFormField label={t('doctor.supportContactForm.fields.message.label')} required>
        <textarea
          value={form.message}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, message: event.target.value }))
          }
          rows={5}
          placeholder={t('doctor.supportContactForm.fields.message.placeholder')}
          className={profileFieldClass(profileTextareaClass, false)}
        />
      </DoctorProfileFormField>

      <button
        type="submit"
        disabled={submitting || loadingIdentity}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.28)] transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? t('doctor.supportContactForm.preparing') : t('doctor.supportContactForm.submit')}
        <Send className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
