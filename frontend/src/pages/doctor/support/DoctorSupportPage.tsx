'use client';

import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import {
  DoctorSupportChannels,
  DoctorSupportContactForm,
} from '@/components/doctor/support';
import { FaqAccordionList } from '@/components/platform/faq-accordion';
import { PlatformFooter } from '@/components/platform/platform-footer';
import { usePlatformSupport } from '@/components/platform/platform-support-provider';
import { useDoctorSupportPage } from '@/hooks/doctor/support/useDoctorSupportPage';
import { useI18n } from '@/i18n/provider';
import { Loader2 } from 'lucide-react';

type SupportCard =
  | {
      id: string;
      title: string;
      description: string;
      icon: typeof BookOpen;
      href: string;
      modal?: never;
    }
  | {
      id: string;
      title: string;
      description: string;
      icon:
        | typeof HelpCircle
        | typeof MessageSquare
        | typeof FileText
        | typeof ShieldCheck;
      modal: 'faq' | 'contact' | 'terms' | 'privacy';
      href?: never;
    };

const SUPPORT_CARDS: readonly SupportCard[] = [
  {
    id: 'medical-library',
    title: 'المكتبة الطبية',
    description: 'مقالات ونصائح ومحتوى صحي منشور للقراءة السريعة',
    icon: BookOpen,
    href: '/doctor/medical-library',
  },
  {
    id: 'faq',
    title: 'الأسئلة الشائعة',
    description: 'إجابات سريعة عن الاشتراك والخصوصية والدعم',
    icon: HelpCircle,
    modal: 'faq' as const,
  },
  {
    id: 'contact',
    title: 'تواصل معنا',
    description: 'أرسل رسالة مع تفاصيل طلبك',
    icon: MessageSquare,
    modal: 'contact' as const,
  },
  {
    id: 'terms',
    title: 'الشروط والأحكام',
    description: 'اطّلع على شروط استخدام المنصة',
    icon: FileText,
    modal: 'terms' as const,
  },
  {
    id: 'privacy',
    title: 'سياسة الخصوصية',
    description: 'كيف نحمي بياناتك الطبية والشخصية',
    icon: ShieldCheck,
    modal: 'privacy' as const,
  },
];

export default function DoctorSupportPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { openModal } = usePlatformSupport();
  const support = useDoctorSupportPage(locale);

  return (
    <>
      <Helmet>
        <title>{tr('الدعم والمساعدة • LMJ Health', 'Support • LMJ Health')}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="doctor"
          surface="mint"
          title={tr('الدعم والمساعدة', 'Support & Help')}
          subtitle={tr(
            'الأسئلة الشائعة، قنوات التواصل، والوثائق القانونية من منصة LMJ Health',
            'FAQs, contact channels, and legal documents from LMJ Health',
          )}
          headerIcon={<HelpCircle className="h-8 w-8 text-white" aria-hidden />}
          actionLabel={tr('تواصل مع الدعم', 'Contact support')}
          onActionClick={() => openModal('contact')}
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SUPPORT_CARDS.map(({ id, title, description, icon: Icon, modal, href }) =>
            href ? (
              <Link
                key={id}
                to={href}
                className="rounded-[14px] border border-[#D1FAE5] bg-white p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="font-cairo text-[16px] font-extrabold text-[#111827]">
                  {title}
                </h2>
                <p className="mt-2 font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                  {description}
                </p>
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                onClick={() => openModal(modal!)}
                className="rounded-[14px] border border-[#D1FAE5] bg-white p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#F0FDFA] text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="font-cairo text-[16px] font-extrabold text-[#111827]">
                  {title}
                </h2>
                <p className="mt-2 font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                  {description}
                </p>
              </button>
            ),
          )}
        </div>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 text-start sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-cairo text-[18px] font-extrabold text-primary">
              قنوات التواصل الرسمية
            </h2>
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              بيانات محدّثة من إعدادات المنصة
            </p>
          </div>
          <DoctorSupportChannels
            channels={support.contactChannels}
            loading={support.isAwaitingContactData}
          />
          <div className="mt-5 border-t border-[#ECFDF3] pt-5">
            <Link
              to="/doctor/medical-library"
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#B8E6E0] bg-[#F0FDFA] px-4 py-2 font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F7F5]"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              تصفح المكتبة الطبية العامة
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-start font-cairo text-[18px] font-extrabold text-primary">
            إرسال طلب دعم
          </h2>
          <DoctorSupportContactForm
            identity={support.identity}
            supportEmail={support.supportEmail}
            loadingIdentity={support.isAwaitingProfileData}
          />
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-start font-cairo text-[18px] font-extrabold text-primary">
            الأسئلة الشائعة
          </h2>
          {support.isAwaitingFaqData ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <FaqAccordionList items={support.faqItems} />
          )}
        </section>

        <PlatformFooter />
      </div>
    </>
  );
}
