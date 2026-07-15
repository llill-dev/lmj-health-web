"use client";

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
import { fetchMedicalServiceDetails } from "@/lib/doctor/medical-services-directory/fetch";

function ContactLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
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
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId ?? "";
  const detailsQuery = useQuery({
    queryKey: ["doctor", "medical-service-details", serviceId],
    queryFn: () => fetchMedicalServiceDetails(serviceId),
    enabled: Boolean(serviceId),
    staleTime: 1000 * 60 * 5,
  });

  if (detailsQuery.isLoading) {
    return (
      <div dir="rtl" lang="ar" className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 font-cairo text-[14px] font-bold text-[#667085]">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          جارٍ تحميل ملف الجهة الطبية...
        </div>
      </div>
    );
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div dir="rtl" lang="ar" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <DoctorListErrorState
          title="تعذّر تحميل تفاصيل الجهة الطبية"
          brief={
            detailsQuery.error
              ? getUserFacingRequestErrorMessage(detailsQuery.error)
              : "هذه الجهة غير متاحة حالياً."
          }
          onRetry={() => void detailsQuery.refetch()}
        />
      </div>
    );
  }

  const facility = detailsQuery.data;

  return (
    <>
      <Helmet>
        <title>{facility.name} • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/doctor/medical-services-directory"
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى دليل الخدمات الطبية
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
                عرض معلومات وتواصل مباشر فقط
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
                    ساعات العمل
                  </h2>
                </div>
                <div className="space-y-2 rounded-[18px] border border-[#E4E7EC] bg-[#FCFCFD] px-5 py-4">
                  {facility.workingHours.map((entry) => (
                    <div
                      key={`${entry.days}-${entry.hours}`}
                      className="flex items-center justify-between gap-4 font-cairo text-[13px]"
                    >
                      <span className="font-extrabold text-[#101828]">{entry.days}</span>
                      <span className="font-semibold text-[#667085]">{entry.hours}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {facility.services.length > 0 ? (
              <section>
                <h2 className="mb-4 font-cairo text-[18px] font-black text-[#101828]">
                  الخدمات المتاحة
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
                  وسائل التواصل
                </h2>
                <div className="flex flex-wrap gap-3">
                  {facility.contact.phone ? (
                    <ContactLink
                      href={facility.contact.phone}
                      label="اتصال مباشر"
                      icon={<Phone className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.whatsapp ? (
                    <ContactLink
                      href={facility.contact.whatsapp}
                      label="واتساب"
                      icon={<ExternalLink className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.facebook ? (
                    <ContactLink
                      href={facility.contact.facebook}
                      label="فيسبوك"
                      icon={<Facebook className="h-4 w-4" />}
                    />
                  ) : null}
                  {facility.contact.website ? (
                    <ContactLink
                      href={facility.contact.website}
                      label="الموقع الإلكتروني"
                      icon={<Globe className="h-4 w-4" />}
                    />
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4">
              <h2 className="font-cairo text-[16px] font-black text-[#92400E]">
                ملاحظة مهمة
              </h2>
              <p className="mt-2 font-cairo text-[13px] font-bold leading-7 text-[#92400E]">
                الحجز أو طلب الخدمة من داخل المنصة غير مدعوم حالياً لهذا الدليل. المتاح هو
                استعراض المعلومات والتواصل المباشر مع الجهة الطبية.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
