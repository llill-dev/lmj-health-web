'use client';

import { Send, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlatformModalShell } from '@/components/platform/platform-modal-shell';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  WhatsAppIcon,
} from '@/components/platform/social-icons';
import { useToast } from '@/components/ui/ToastProvider';
import { useDoctorProfile } from '@/hooks/doctor/useDoctorProfile';
import { usePlatformContactContent } from '@/hooks/platform/usePlatformContent';
import { ApiError } from '@/lib/api';
import { submitDoctorSupportRequest } from '@/lib/doctor/support/submitDoctorSupportRequest';
import type { DoctorSupportRequestType } from '@/lib/doctor/support/types';
import { platformApi } from '@/lib/platform/client';
import {
  openSupportMailto,
  resolveSupportEmail,
} from '@/lib/platform/supportContact';
import { useAuthStore } from '@/store/authStore';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-right font-cairo text-[13px] font-extrabold text-[#111827]">
        {label}
        {required ? <span className="ms-1 text-[#DC2626]">*</span> : null}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[13px] font-semibold text-[#111827] text-right placeholder:text-right outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white';

const textareaClass =
  'w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 font-cairo text-[13px] font-semibold text-[#111827] text-right placeholder:text-right outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white';

const FALLBACK_SOCIAL = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: 'https://wa.me/',
    className: 'bg-[#25D366]',
    Icon: WhatsAppIcon,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/',
    className: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    Icon: InstagramIcon,
  },
  {
    id: 'twitter',
    label: 'Twitter',
    href: 'https://twitter.com/',
    className: 'bg-[#1DA1F2]',
    Icon: TwitterIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://facebook.com/',
    className: 'bg-[#1877F2]',
    Icon: FacebookIcon,
  },
] as const;

type ContactUsFormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const EMPTY_CONTACT_FORM: ContactUsFormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function socialIconForChannel(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return WhatsAppIcon;
  if (lower.includes('instagram')) return InstagramIcon;
  if (lower.includes('twitter') || lower.includes('x.com')) return TwitterIcon;
  if (lower.includes('facebook')) return FacebookIcon;
  return Send;
}

export function ContactUsDialog({
  open,
  onClose,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<ContactUsFormState>;
}) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const doctorProfileQuery = useDoctorProfile();
  const contactQuery = usePlatformContactContent('ar');
  const doctorProfile = doctorProfileQuery.data?.doctor;
  const doctorUser = doctorProfile?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [form, setForm] = useState<ContactUsFormState>(EMPTY_CONTACT_FORM);

  useEffect(() => {
    if (!open) return;
    const profileName = doctorUser?.fullName?.trim();
    const profileEmail = doctorUser?.email?.trim();
    const profilePhone = doctorUser?.phone?.trim();

    setForm({
      fullName:
        initialValues?.fullName ??
        profileName ??
        user?.name ??
        '',
      email:
        initialValues?.email ??
        profileEmail ??
        user?.email ??
        '',
      phone:
        initialValues?.phone ??
        profilePhone ??
        user?.phone ??
        '',
      subject: initialValues?.subject ?? '',
      message: initialValues?.message ?? '',
    });
  }, [
    open,
    initialValues?.email,
    initialValues?.phone,
    initialValues?.subject,
    initialValues?.message,
    initialValues?.fullName,
    doctorUser?.email,
    doctorUser?.fullName,
    doctorUser?.phone,
    user?.email,
    user?.name,
    user?.phone,
  ]);

  const socialLinks =
    contactQuery.channels.length > 0
      ? contactQuery.channels
          .filter((channel) => channel.kind === 'social' || channel.kind === 'whatsapp')
          .map((channel) => ({
            id: channel.id,
            label: channel.label,
            href: channel.url,
            className:
              channel.kind === 'whatsapp'
                ? 'bg-[#25D366]'
                : 'bg-primary',
            Icon: socialIconForChannel(channel.url),
          }))
      : FALLBACK_SOCIAL;

  const buildSupportMessage = () =>
    [
      form.message.trim(),
      form.fullName.trim() ? `\n\nالاسم: ${form.fullName.trim()}` : '',
      form.email.trim() ? `\nالبريد: ${form.email.trim()}` : '',
      form.phone.trim() ? `\nالهاتف: ${form.phone.trim()}` : '',
      user?.role ? `\nالدور: ${user.role}` : '',
    ]
      .join('')
      .trim();

  const submitViaSupportEmail = () => {
    openSupportMailto({
      email: resolveSupportEmail(contactQuery.channels),
      subject: form.subject.trim() || 'طلب دعم فني',
      body: buildSupportMessage(),
    });
    toast('تم تجهيز رسالتك في تطبيق البريد. أرسلها لإكمال التواصل مع الدعم.', {
      title: 'فتح البريد',
      variant: 'success',
    });
    setForm(EMPTY_CONTACT_FORM);
    setSelectedFileName(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast('يرجى تعبئة موضوع الرسالة والنص.', {
        title: 'حقول ناقصة',
        variant: 'error',
      });
      return;
    }

    if (user?.role === 'doctor') {
      setSubmitting(true);
      try {
        submitDoctorSupportRequest({
          form: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            subject: form.subject,
            message: form.message,
            requestType: 'technical' satisfies DoctorSupportRequestType,
          },
          identity: {
            doctorProfileId:
              doctorProfile?._id ??
              doctorProfileQuery.data?.actorIds?.doctorId ??
              null,
            fullName: doctorUser?.fullName ?? form.fullName,
            email: doctorUser?.email ?? form.email,
            phone: doctorUser?.phone ?? form.phone,
          },
          supportEmail: resolveSupportEmail(contactQuery.channels),
        });
        toast('تم تجهيز رسالتك في تطبيق البريد. أرسلها لإكمال التواصل مع فريق الدعم.', {
          title: 'فتح البريد',
          variant: 'success',
        });
        setForm(EMPTY_CONTACT_FORM);
        setSelectedFileName(null);
        onClose();
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (user?.role !== 'patient') {
      setSubmitting(true);
      try {
        submitViaSupportEmail();
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      await platformApi.complaints.create({
        type: 'technical',
        subject: form.subject.trim(),
        message: buildSupportMessage(),
      });

      toast('سيتواصل معك فريق الدعم في أقرب وقت.', {
        title: 'تم إرسال رسالتك',
        variant: 'success',
      });
      setForm(EMPTY_CONTACT_FORM);
      setSelectedFileName(null);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
        submitViaSupportEmail();
        return;
      }

      toast(
        error instanceof ApiError
          ? error.message
          : 'تعذّر إرسال الرسالة. حاول مجدداً أو استخدم قنوات التواصل المباشرة.',
        { title: 'خطأ', variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformModalShell
      open={open}
      onClose={onClose}
      title="تواصل معنا"
      maxWidthClass="max-w-[620px]"
    >
      <form
        onSubmit={handleSubmit}
        dir="rtl"
        lang="ar"
        className="space-y-5 text-right"
      >
        <div className="flex gap-2 justify-start items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary">
            <Send className="w-4 h-4" aria-hidden />
          </div>
          <h3 className="font-cairo text-[16px] font-extrabold text-[#111827]">
            أرسل رسالة
          </h3>
        </div>

        <Field label="الاسم الكامل">
          <input
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
            placeholder="أدخل اسمك الكامل"
            className={inputClass}
          />
        </Field>

        <Field label="البريد الإلكتروني">
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="example@email.com"
            className={inputClass}
          />
        </Field>

        <Field label="رقم الهاتف">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+963 9XX XXX XXX"
            className={inputClass}
          />
        </Field>

        <Field label="العنوان" required>
          <input
            value={form.subject}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, subject: e.target.value }))
            }
            placeholder="موضوع الرسالة"
            className={inputClass}
          />
        </Field>

        <Field label="الرسالة" required>
          <textarea
            value={form.message}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, message: e.target.value }))
            }
            rows={4}
            placeholder="اكتب رسالتك هنا..."
            className={textareaClass}
          />
        </Field>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setSelectedFileName(file?.name ?? null);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-8 transition hover:border-primary hover:bg-[#F0FDFA]"
          >
            <UploadCloud className="w-8 h-8 text-primary" aria-hidden />
            <span className="font-cairo text-[14px] font-extrabold text-[#111827]">
              {selectedFileName ?? "اضغط لاختيار ملف"}
            </span>
            <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
              المرفقات عبر API متاحة للمرضى فقط (POST /api/complaints + ملفات المريض)
            </span>
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(15,143,139,0.28)] transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "جاري الإرسال..." : "إرسال الرسالة"}
          <Send className="w-4 h-4" aria-hidden />
        </button>

        <div className="rounded-[14px] bg-[#ECFEFF] px-5 py-5">
          <p className="mb-4 text-center font-cairo text-[14px] font-extrabold text-[#111827]">
            تابعنا على
          </p>
          <div className="flex gap-3 justify-center items-center">
            {socialLinks.map(({ id, label, href, className, Icon }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className={`flex justify-center items-center w-10 h-10 text-white rounded-full shadow-sm transition hover:scale-105 ${className}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </form>
    </PlatformModalShell>
  );
}
