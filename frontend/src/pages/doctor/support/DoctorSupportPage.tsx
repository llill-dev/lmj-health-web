'use client';

import { Helmet } from 'react-helmet-async';
import {
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import {
  DoctorSupportChannels,
  DoctorSupportContactForm,
} from '@/components/doctor/support';
import { FaqAccordionList } from '@/components/platform/faq-accordion';
import { PlatformFooter } from '@/components/platform/platform-footer';
import { usePlatformSupport } from '@/components/platform/platform-support-provider';
import { useDoctorSupportPage } from '@/hooks/doctor/support/useDoctorSupportPage';
import { Loader2 } from 'lucide-react';

const SUPPORT_CARDS = [
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
] as const;

export default function DoctorSupportPage() {
  const { openModal } = usePlatformSupport();
  const support = useDoctorSupportPage('ar');

  return (
    <>
      <Helmet>
        <title>الدعم والمساعدة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="doctor"
          surface="mint"
          title="الدعم والمساعدة"
          subtitle="الأسئلة الشائعة، قنوات التواصل، والوثائق القانونية من منصة LMJ Health"
          headerIcon={<HelpCircle className="h-8 w-8 text-white" aria-hidden />}
          actionLabel="تواصل مع الدعم"
          onActionClick={() => openModal('contact')}
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SUPPORT_CARDS.map(({ id, title, description, icon: Icon, modal }) => (
            <button
              key={id}
              type="button"
              onClick={() => openModal(modal)}
              className="rounded-[14px] border border-[#D1FAE5] bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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
          ))}
        </div>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 text-right sm:flex-row sm:items-center sm:justify-between">
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
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-right font-cairo text-[18px] font-extrabold text-primary">
            إرسال طلب دعم
          </h2>
          <DoctorSupportContactForm
            identity={support.identity}
            supportEmail={support.supportEmail}
            loadingIdentity={support.isAwaitingProfileData}
          />
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-right font-cairo text-[18px] font-extrabold text-primary">
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
