'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Facebook,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Share2,
  TriangleAlert,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMedicalServiceDetails } from '@/lib/doctor/medical-services-directory/fetch';
import type { MedicalServiceFacility } from '@/lib/doctor/medical-services-directory/types';
import { cn } from '@/lib/utils/utils';

function ContactButton({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_8px_16px_rgba(15,23,42,0.12)] transition-transform hover:scale-105',
        className,
      )}
    >
      {children}
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('h-5 w-5 fill-current', className)}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function mergeFacilityDetails(
  base: MedicalServiceFacility,
  details: MedicalServiceFacility | null | undefined,
): MedicalServiceFacility {
  if (!details) return base;

  return {
    ...base,
    ...details,
    tags: details.tags.length > 0 ? details.tags : base.tags,
    services: details.services.length > 0 ? details.services : base.services,
    workingHours:
      details.workingHours.length > 0
        ? details.workingHours
        : base.workingHours,
    imageUrl: details.imageUrl || base.imageUrl,
    description: details.description || base.description,
    shortDescription: details.shortDescription || base.shortDescription,
    location: details.location || base.location,
    contact: {
      phone: details.contact.phone || base.contact.phone,
      whatsapp: details.contact.whatsapp || base.contact.whatsapp,
      facebook: details.contact.facebook || base.contact.facebook,
      website: details.contact.website || base.contact.website,
    },
  };
}

export function FacilityDirectoryCard({
  facility,
  expanded,
  onToggle,
}: {
  facility: MedicalServiceFacility;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailsQuery = useQuery({
    queryKey: ['medical-services-directory', 'details', facility.id] as const,
    queryFn: () => fetchMedicalServiceDetails(facility.id),
    enabled: expanded,
    staleTime: 1000 * 60 * 5,
  });
  const displayFacility = mergeFacilityDetails(facility, detailsQuery.data);

  const handleShare = async () => {
    const shareData = {
      title: displayFacility.name,
      text: displayFacility.shortDescription,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
      return;
    }
    await navigator.clipboard.writeText(
      `${displayFacility.name} — ${displayFacility.location}`,
    );
  };

  if (!expanded) {
    return (
      <article className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-4 px-4 py-4 text-start transition hover:bg-[#F9FAFB] sm:px-5"
        >
          <div className="h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[10px] border border-[#EEF2F6] bg-[#F3F4F6]">
            <img
              src={displayFacility.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-cairo text-[15px] font-extrabold text-[#111827]">
              {displayFacility.name}
            </h3>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
              {displayFacility.shortDescription}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {displayFacility.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <ChevronDown
            className="h-5 w-5 shrink-0 text-[#98A2B3]"
            aria-hidden
          />
        </button>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
      <div className="relative h-[180px] overflow-hidden sm:h-[200px]">
        <img
          src={displayFacility.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-black/10 to-transparent" />

        <div className="absolute inset-y-0 start-0 flex w-[min(100%,320px)] items-stretch">
          <div className="flex flex-1 flex-col justify-center bg-primary/90 px-5 py-4 pt-12 text-white backdrop-blur-[2px] sm:pt-4">
            <h3 className="font-cairo text-[18px] font-black leading-tight sm:text-[20px]">
              {displayFacility.name}
            </h3>
            <p className="mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold opacity-95">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {displayFacility.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="absolute end-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition hover:bg-white"
          aria-label="مشاركة"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="absolute start-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition hover:bg-white"
          aria-label="طي التفاصيل"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        {detailsQuery.isFetching ? (
          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            جارٍ تحديث التفاصيل...
          </div>
        ) : null}

        {detailsQuery.isError ? (
          <div className="flex items-center gap-2 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 font-cairo text-[12px] font-bold text-[#92400E]">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            تعذّر تحميل التفاصيل الإضافية، ويتم عرض البيانات المتاحة حالياً.
          </div>
        ) : null}

        <p className="font-cairo text-[13px] font-semibold leading-[24px] text-[#667085]">
          {displayFacility.description}
        </p>

        {displayFacility.workingHours.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" aria-hidden />
              <h4 className="font-cairo text-[14px] font-extrabold text-[#111827]">
                ساعات العمل
              </h4>
            </div>
            <div className="space-y-2 rounded-[10px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-3">
              {displayFacility.workingHours.map((entry) => (
                <div
                  key={`${entry.days}-${entry.hours}`}
                  className="flex items-center justify-between gap-4 font-cairo text-[12px]"
                >
                  <span className="font-extrabold text-[#111827]">
                    {entry.days}
                  </span>
                  <span className="font-semibold text-[#667085] tabular-nums">
                    {entry.hours}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {displayFacility.services.length > 0 ? (
          <section>
            <h4 className="mb-3 font-cairo text-[14px] font-extrabold text-[#111827]">
              الخدمات
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {displayFacility.services.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-2 font-cairo text-[12px] font-semibold text-[#667085]"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  {service}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {displayFacility.contact.phone ||
        displayFacility.contact.whatsapp ||
        displayFacility.contact.facebook ||
        displayFacility.contact.website ? (
          <section>
            <h4 className="mb-3 font-cairo text-[14px] font-extrabold text-[#111827]">
              التواصل
            </h4>
            <div className="flex flex-wrap items-center gap-3">
            {displayFacility.contact.whatsapp ? (
              <ContactButton
                href={displayFacility.contact.whatsapp}
                label="واتساب"
                className="bg-[#25D366]"
              >
                <WhatsAppIcon />
              </ContactButton>
            ) : null}
            {displayFacility.contact.phone ? (
              <ContactButton
                href={displayFacility.contact.phone}
                label="اتصال"
                className="bg-primary"
              >
                <Phone className="h-4 w-4" />
              </ContactButton>
            ) : null}
            {displayFacility.contact.facebook ? (
              <ContactButton
                href={displayFacility.contact.facebook}
                label="فيسبوك"
                className="bg-[#1877F2]"
              >
                <Facebook className="h-4 w-4" />
              </ContactButton>
            ) : null}
            {displayFacility.contact.website ? (
              <ContactButton
                href={displayFacility.contact.website}
                label="الموقع"
                className="bg-[#4B5563]"
              >
                <Globe className="h-4 w-4" />
              </ContactButton>
            ) : null}
          </div>
        </section>
        ) : null}

        <section className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <div className="flex items-start gap-2 font-cairo text-[12px] font-bold text-[#475467]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p>المتاح حالياً هو استعراض البيانات والتواصل المباشر مع الجهة.</p>
              <p>الحجز أو طلب الخدمة من داخل المنصة غير متاح حالياً لهذا الدليل.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Link
            to={`/doctor/medical-services-directory/${encodeURIComponent(displayFacility.id)}`}
            className="inline-flex items-center justify-center rounded-[12px] border border-[#B8E6E0] bg-[#F0FDFA] px-4 py-2 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#E6F7F5]"
          >
            عرض الملف الكامل
          </Link>
        </div>
      </div>
    </article>
  );
}
