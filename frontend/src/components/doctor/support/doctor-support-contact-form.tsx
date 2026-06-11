'use client';

import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { submitDoctorSupportRequest } from '@/lib/doctor/support/submitDoctorSupportRequest';
import type {
  DoctorSupportContactForm,
  DoctorSupportIdentity,
  DoctorSupportRequestType,
} from '@/lib/doctor/support/types';

const INPUT_CLASS =
  'h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[13px] font-semibold text-[#111827] text-right outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white';

const TEXTAREA_CLASS =
  'w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] text-right outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white';

const REQUEST_TYPES: Array<{ value: DoctorSupportRequestType; label: string }> = [
  { value: 'technical', label: 'مشكلة تقنية' },
  { value: 'account', label: 'الحساب والأمان' },
  { value: 'billing', label: 'الفوترة والاشتراك' },
  { value: 'verification', label: 'التحقق والملف المهني' },
  { value: 'other', label: 'أخرى' },
];

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
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DoctorSupportContactForm>(EMPTY_FORM);

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
      toast('يرجى كتابة تفاصيل طلبك.', {
        title: 'حقول ناقصة',
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

      toast('تم تجهيز رسالتك في تطبيق البريد. أرسلها لإكمال التواصل مع فريق الدعم.', {
        title: 'فتح البريد',
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
      dir="rtl"
      lang="ar"
      className="space-y-4 text-right"
    >
      <div className="rounded-[12px] border border-[#E0F2FE] bg-[#F0F9FF] px-4 py-3">
        <p className="font-cairo text-[12px] font-semibold leading-[20px] text-[#0369A1]">
          طلبات الدعم للأطباء تُرسل عبر البريد الرسمي للمنصة (حسب إعدادات CMS).
          مسار الشكاوى عبر API مخصّص للمرضى فقط.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
            نوع الطلب
          </label>
          <select
            value={form.requestType}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                requestType: event.target.value as DoctorSupportRequestType,
              }))
            }
            className={INPUT_CLASS}
          >
            {REQUEST_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
            الموضوع
          </label>
          <input
            value={form.subject}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, subject: event.target.value }))
            }
            placeholder="موضوع الرسالة"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
            الاسم الكامل
          </label>
          <input
            value={form.fullName}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            placeholder="اسم الطبيب"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={form.email}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="example@email.com"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={form.phone}
            disabled={loadingIdentity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="+963 9XX XXX XXX"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-cairo text-[13px] font-extrabold text-[#111827]">
          الرسالة <span className="text-[#DC2626]">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, message: event.target.value }))
          }
          rows={5}
          placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..."
          className={TEXTAREA_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || loadingIdentity}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.28)] transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? 'جاري التجهيز...' : 'إرسال طلب الدعم'}
        <Send className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
