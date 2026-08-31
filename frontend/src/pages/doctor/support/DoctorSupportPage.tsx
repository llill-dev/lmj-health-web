"use client";

import { Helmet } from "react-helmet-async";
import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import {
  DoctorSupportChannels,
  DoctorSupportContactForm,
} from "@/components/doctor/support";
import { FaqAccordionList } from "@/components/platform/faq-accordion";
import { PlatformFooter } from "@/components/platform/platform-footer";
import { usePlatformSupport } from "@/components/platform/platform-support-provider";
import { useDoctorSupportPage } from "@/hooks/doctor/support/useDoctorSupportPage";
import { useI18n } from "@/i18n/provider";
import { Loader2 } from "lucide-react";

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
      modal: "faq" | "contact" | "terms" | "privacy";
      href?: never;
    };

function buildSupportCards(t: (key: string) => string): readonly SupportCard[] {
  return [
    {
      id: "medical-library",
      title: t("doctor.support.medicalLibrary.title"),
      description: t("doctor.support.medicalLibrary.description"),
      icon: BookOpen,
      href: "/doctor/medical-library",
    },
    {
      id: "faq",
      title: t("doctor.support.faq.title"),
      description: t("doctor.support.faq.description"),
      icon: HelpCircle,
      modal: "faq" as const,
    },
    {
      id: "contact",
      title: t("doctor.support.contact.title"),
      description: t("doctor.support.contact.description"),
      icon: MessageSquare,
      modal: "contact" as const,
    },
    {
      id: "terms",
      title: t("doctor.support.terms.title"),
      description: t("doctor.support.terms.description"),
      icon: FileText,
      modal: "terms" as const,
    },
    {
      id: "privacy",
      title: t("doctor.support.privacy.title"),
      description: t("doctor.support.privacy.description"),
      icon: ShieldCheck,
      modal: "privacy" as const,
    },
  ];
}

export default function DoctorSupportPage() {
  const { t, locale, dir } = useI18n();
  const supportCards = buildSupportCards(t);
  const { openModal } = usePlatformSupport();
  const support = useDoctorSupportPage(locale);

  return (
    <>
      <Helmet>
        <title>{t("doctor.support.pageTitle")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="doctor"
          surface="mint"
          title={t("doctor.support.title")}
          subtitle={t("doctor.support.subtitle")}
          headerIcon={<HelpCircle className="h-8 w-8 text-white" aria-hidden />}
          actionLabel={t("doctor.support.contactSupport")}
          onActionClick={() => openModal("contact")}
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {supportCards.map(
            ({ id, title, description, icon: Icon, modal, href }) =>
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
              {t("doctor.support.officialChannels")}
            </h2>
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              {t("doctor.support.dataUpdated")}
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
              {t("doctor.support.browseLibrary")}
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-start font-cairo text-[18px] font-extrabold text-primary">
            {t("doctor.support.sendRequest")}
          </h2>
          <DoctorSupportContactForm
            identity={support.identity}
            supportEmail={support.supportEmail}
            loadingIdentity={support.isAwaitingProfileData}
          />
        </section>

        <section className="mb-8 rounded-[14px] border border-[#D1FAE5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-start font-cairo text-[18px] font-extrabold text-primary">
            {t("doctor.support.faqSection")}
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
