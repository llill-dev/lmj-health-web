"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Facebook,
  Globe,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import {
  fetchMedicalServiceDetails,
  fetchMedicalServicesCatalog,
} from "@/lib/doctor/medical-services-directory/fetch";
import { useI18n } from "@/i18n/provider";

function ContactLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-[12px] border border-[#D9F2EF] bg-white px-4 py-3 font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
    >
      {icon}
      {label}
    </a>
  );
}

export default function DoctorMedicalServiceDetailsPage() {
  const { t, locale, dir } = useI18n();
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId ?? "";
  const detailsQuery = useQuery({
    queryKey: ["doctor", "medical-service-details", serviceId, locale],
    queryFn: () => fetchMedicalServiceDetails(serviceId, locale),
    enabled: Boolean(serviceId),
    staleTime: 1000 * 60 * 5,
  });
  const relatedQuery = useQuery({
    queryKey: ["doctor", "medical-service-related", serviceId, locale],
    queryFn: () => fetchMedicalServicesCatalog(undefined, locale),
    enabled: Boolean(serviceId),
    staleTime: 1000 * 60 * 5,
  });

  if (detailsQuery.isLoading) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="flex items-center gap-3 font-cairo text-[14px] font-bold text-[#667085]">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          {t("doctor.medicalServiceDetails.loading")}
        </div>
      </div>
    );
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      >
        <DoctorListErrorState
          title={t("doctor.medicalServiceDetails.loadFailed")}
          brief={
            detailsQuery.error
              ? getUserFacingRequestErrorMessage(detailsQuery.error)
              : t("doctor.medicalServiceDetails.notAvailable")
          }
          onRetry={() => void detailsQuery.refetch()}
        />
      </div>
    );
  }

  const facility = detailsQuery.data;
  const relatedFacilities = (relatedQuery.data ?? [])
    .filter(
      (item) => item.id !== facility.id && item.category === facility.category,
    )
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{facility.name} • LMJ Health</title>
      </Helmet>

      <div
        dir={dir}
        lang={locale}
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      >
        <Link
          to="/doctor/medical-services-directory"
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("doctor.medicalServiceDetails.backToDirectory")}
        </Link>

        <article className="overflow-hidden rounded-[28px] border border-[#E4E7EC] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#E4E7EC] bg-[#F8FAFC]">
            <img
              src={facility.imageUrl}
              alt={facility.name}
              className="h-[240px] w-full object-cover sm:h-[340px]"
            />
          </div>

          <div className="bg-[linear-gradient(135deg,#E6F7F5_0%,#FFFFFF_65%,#F8FAFC_100%)] px-6 py-8 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-cairo text-[28px] font-black leading-[1.5] text-[#101828] sm:text-[34px]">
                  {facility.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 font-cairo text-[13px] font-bold text-[#667085]">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {facility.location}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-primary shadow-sm">
                {t("doctor.medicalServiceDetails.infoOnly")}
              </span>
            </div>

            <p className="mt-5 font-cairo text-[14px] font-semibold leading-8 text-[#475467]">
              {facility.description}
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-8">
            {facility.workingHours.length > 0 ? (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <h2 className="font-cairo text-[18px] font-black text-[#101828]">
                    {t("doctor.medicalServiceDetails.workingHours")}
                  </h2>
                </div>
                <div className="space-y-2 rounded-[18px] border border-[#E4E7EC] bg-[#FCFCFD] px-5 py-4">
                  {facility.workingHours.map((entry) => (
                    <div
                      key={`${entry.days}-${entry.hours}`}
                      className="flex items-center justify-between gap-4 font-cairo text-[13px]"
                    >
                      <span className="font-extrabold text-[#101828]">
                        {entry.days}
                      </span>
                      <span className="font-semibold text-[#667085]">
                        {entry.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {facility.services.length > 0 ? (
              <section>
                <h2 className="mb-4 font-cairo text-[18px] font-black text-[#101828]">
                  {t("doctor.medicalServiceDetails.availableServices")}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {facility.services.map((service) => (
                    <div
                      key={service}
                      className="flex items-center gap-2 rounded-[14px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-semibold text-[#475467]"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {service}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {facility.contact.phone ||
            facility.contact.whatsapp ||
            facility.contact.facebook ||
            facility.contact.website ? (
              <section>
                <h2 className="mb-4 font-cairo text-[18px] font-black text-[#101828]">
                  {t("doctor.medicalServiceDetails.contactMethods")}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {facility.contact.phone ? (
                    <ContactLink
                      href={facility.contact.phone}
                      label={t("doctor.medicalServiceDetails.directCall")}
                      icon={<Phone className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.whatsapp ? (
                    <ContactLink
                      href={facility.contact.whatsapp}
                      label={t("doctor.medicalServiceDetails.whatsapp")}
                      icon={<ExternalLink className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.facebook ? (
                    <ContactLink
                      href={facility.contact.facebook}
                      label={t("doctor.medicalServiceDetails.facebook")}
                      icon={<Facebook className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.website ? (
                    <ContactLink
                      href={facility.contact.website}
                      label={t("doctor.medicalServiceDetails.website")}
                      icon={<Globe className="h-4 w-4" />}
                    />
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4">
              <h2 className="font-cairo text-[16px] font-black text-[#92400E]">
                {t("doctor.medicalServiceDetails.importantNote")}
              </h2>
              <p className="mt-2 font-cairo text-[13px] font-bold leading-7 text-[#92400E]">
                {t("doctor.medicalServiceDetails.noteText")}
              </p>
            </section>

            {relatedFacilities.length > 0 ? (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-cairo text-[18px] font-black text-[#101828]">
                    {t("doctor.medicalServiceDetails.similarProviders")}
                  </h2>
                  <Link
                    to="/doctor/medical-services-directory"
                    className="font-cairo text-[12px] font-extrabold text-primary transition hover:opacity-80"
                  >
                    {t("doctor.medicalServiceDetails.backToDirectoryShort")}
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {relatedFacilities.map((item) => (
                    <Link
                      key={item.id}
                      to={`/doctor/medical-services-directory/${encodeURIComponent(item.id)}`}
                      className="rounded-[18px] border border-[#E4E7EC] bg-[#FCFCFD] p-4 transition hover:border-[#B8E6E0] hover:bg-white"
                    >
                      <div className="font-cairo text-[11px] font-extrabold text-primary">
                        {item.location}
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-cairo text-[15px] font-black leading-7 text-[#101828]">
                        {item.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                        {item.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
