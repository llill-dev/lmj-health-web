'use client';

import {
  ChevronLeft,
  Globe,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '@/components/platform/social-icons';
import { usePlatformSupport } from '@/components/platform/platform-support-provider';
import {
  usePlatformAboutContent,
  usePlatformContactContent,
  usePlatformServiceTypes,
} from '@/hooks/platform/usePlatformContent';

const FALLBACK_SOCIAL = [
  { id: 'facebook', href: 'https://facebook.com/', Icon: FacebookIcon, className: 'bg-[#1877F2]' },
  { id: 'twitter', href: 'https://twitter.com/', Icon: TwitterIcon, className: 'bg-[#1DA1F2]' },
  {
    id: 'instagram',
    href: 'https://instagram.com/',
    Icon: InstagramIcon,
    className: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
  },
  { id: 'linkedin', href: 'https://linkedin.com/', Icon: LinkedInIcon, className: 'bg-[#0A66C2]' },
] as const;

function socialIconForUrl(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('facebook')) return FacebookIcon;
  if (lower.includes('instagram')) return InstagramIcon;
  if (lower.includes('linkedin')) return LinkedInIcon;
  if (lower.includes('twitter') || lower.includes('x.com')) return TwitterIcon;
  return null;
}

export function PlatformFooter() {
  const { openModal } = usePlatformSupport();
  const aboutQuery = usePlatformAboutContent('ar');
  const contactQuery = usePlatformContactContent('ar');
  const servicesQuery = usePlatformServiceTypes('ar');

  const socialLinks = contactQuery.channels
    .filter((channel) => channel.kind === 'social')
    .map((channel, index) => {
      const Icon = socialIconForUrl(channel.url);
      if (!Icon) return null;
      return {
        id: channel.id,
        href: channel.url,
        Icon,
        className: FALLBACK_SOCIAL[index % FALLBACK_SOCIAL.length]?.className ?? 'bg-primary',
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    href: string;
    Icon: typeof FacebookIcon;
    className: string;
  }>;

  const footerSocial = socialLinks.length ? socialLinks : FALLBACK_SOCIAL;
  const services = (servicesQuery.data ?? []).slice(0, 4);

  return (
    <footer
      dir="rtl"
      lang="ar"
      className="mt-10 w-full overflow-hidden rounded-[12px] bg-[#108a82] text-white"
    >
      <div className="px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <section className="text-right">
            <h3 className="mb-4 font-cairo text-[18px] font-extrabold">عن المنصة</h3>
            <p className="font-cairo text-[13px] font-semibold leading-[24px] text-white/90">
              {aboutQuery.summary}
            </p>
            <div className="mt-5 flex justify-start gap-2">
              {footerSocial.map(({ id, href, Icon, className }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-105 ${className}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>

          <section className="text-right">
            <h3 className="mb-4 font-cairo text-[18px] font-extrabold">القسم القانوني</h3>
            <ul className="space-y-3">
              {[
                { label: 'الشروط والأحكام', modal: 'terms' as const },
                { label: 'سياسة الخصوصية', modal: 'privacy' as const },
                { label: 'سياسة الاستخدام', modal: 'usage' as const },
              ].map((item) => (
                <li key={item.modal}>
                  <button
                    type="button"
                    onClick={() => openModal(item.modal)}
                    className="inline-flex items-center gap-2 font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                  >
                    {item.label}
                    <ChevronLeft className="h-4 w-4 opacity-70" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="text-right">
            <h3 className="mb-4 font-cairo text-[18px] font-extrabold">الدعم والمساعدة</h3>
            <ul className="mb-5 space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => openModal('faq')}
                  className="font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                >
                  الأسئلة الشائعة
                </button>
              </li>
              <li>
                <a
                  href="/medical-library"
                  className="font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                >
                  المكتبة الطبية
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openModal('contact')}
                  className="font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                >
                  تواصل معنا
                </button>
              </li>
            </ul>
            <div className="flex justify-start gap-2">
              {[Send, MessageCircle, Mail].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => openModal('contact')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
                  aria-label="تواصل"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </section>

          <section className="text-right">
            <h3 className="mb-4 font-cairo text-[18px] font-extrabold">خدماتنا</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/doctor/appointments"
                  className="font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                >
                  احجز موعد
                </a>
              </li>
              <li>
                <a
                  href="/doctor/doctors-directory"
                  className="font-cairo text-[13px] font-semibold text-white/90 transition hover:text-white"
                >
                  الأطباء
                </a>
              </li>
              {services.map((service) => (
                <li key={service.id}>
                  <span className="font-cairo text-[13px] font-semibold text-white/80">
                    {service.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 px-6 py-5 sm:flex-row sm:px-10">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[8px] border border-white/40 px-4 py-2 font-cairo text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          العربية
          <Globe className="h-4 w-4" aria-hidden />
        </button>
        <p className="font-cairo text-[12px] font-semibold text-white/85" dir="ltr">
          © 2026 SYR HEALTH. All rights reserved
        </p>
      </div>
    </footer>
  );
}
