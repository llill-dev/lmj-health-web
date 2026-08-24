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

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

function buildRequestTypes(
  tr: TrFn = defaultTr,
): Array<{ value: DoctorSupportRequestType; label: string }> {
  return [
    { value: 'technical', label: tr('مشكلة تقنية', 'Technical issue') },
    { value: 'account', label: tr('الحساب والأمان', 'Account & security') },
    { value: 'billing', label: tr('الفوترة والاشتراك', 'Billing & subscription') },
    { value: 'verification', label: tr('التحقق والملف المهني', 'Verification & professional profile') },
    { value: 'other', label: tr('أخرى', 'Other') },
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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DoctorSupportContactForm>(EMPTY_FORM);

  const requestTypeOptions = useMemo(
    () =>
      buildRequestTypes(tr).map((option) => ({
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
      toast(tr('يرجى كتابة تفاصيل طلبك.', 'Please write the details of your request.'), {
        title: tr('حقول ناقصة', 'Missing fields'),
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

      toast(tr('تم تجهيز رسالتك في تطبيق البريد. أرسلها لإكمال التواصل مع فريق الدعم.', 'Your message has been prepared in the mail app. Send it to complete contacting the support team.'), {
        title: tr('فتح البريد', 'Open mail'),
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
          {tr(
            'طلبات الدعم للأطباء تُرسل عبر البريد الرسمي للمنصة (حسب إعدادات CMS). مسار الشكاوى عبر API مخصّص للمرضى فقط.',
            "Doctor support requests are sent via the platform's official email (per CMS settings). The complaints path via the API is reserved for patients only.",
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DoctorProfileFormField label={tr('نوع الطلب', 'Request type')}>
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
            placeholder={tr('اختر نوع الطلب', 'Select the request type')}
            listboxAriaLabel={tr('نوع الطلب', 'Request type')}
            triggerClassName={profileFieldClass('w-full', false)}
          />
        </DoctorProfileFormField>

        <DoctorProfileFormField label={tr('الموضوع', 'Subject')}>
          <input
            value={form.subject}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, subject: event.target.value }))
            }
            placeholder={tr('موضوع الرسالة', 'Message subject')}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DoctorProfileFormField label={tr('الاسم الكامل', 'Full name')}>
          <input
            value={form.fullName}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            placeholder={tr('اسم الطبيب', "Doctor's name")}
            className={profileFieldClass(profileInputClass, false)}
          />
        </DoctorProfileFormField>
        <DoctorProfileFormField label={tr('البريد الإلكتروني', 'Email')}>
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
        <DoctorProfileFormField label={tr('رقم الهاتف', 'Phone number')}>
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

      <DoctorProfileFormField label={tr('الرسالة', 'Message')} required>
        <textarea
          value={form.message}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, message: event.target.value }))
          }
          rows={5}
          placeholder={tr('اشرح مشكلتك أو استفسارك بالتفصيل...', 'Explain your issue or inquiry in detail...')}
          className={profileFieldClass(profileTextareaClass, false)}
        />
      </DoctorProfileFormField>

      <button
        type="submit"
        disabled={submitting || loadingIdentity}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.28)] transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? tr('جاري التجهيز...', 'Preparing...') : tr('إرسال طلب الدعم', 'Send support request')}
        <Send className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
