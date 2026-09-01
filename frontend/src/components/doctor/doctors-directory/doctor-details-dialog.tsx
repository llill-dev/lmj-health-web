'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  CircleCheck,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  Video,
  X,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export type DoctorCardItem = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  tags: string[];
  price: number | null;
  city: string;
  email?: string;
  phone?: string;
  photoUrl?: string | null;
  bio?: string;
  clinicAddress?: string;
  consultationTypes?: string[];
};

export default function DoctorDetailsDialog({
  open,
  doctor,
  onClose,
}: {
  open: boolean;
  doctor: DoctorCardItem | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const hasOnline = doctor?.tags.includes('أونلاين');
  const hasOffline = doctor?.tags.includes('حضوري');

  return (
    <AnimatePresence>
      {open && doctor ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex max-h-[752px] items-center justify-center bg-black/40 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <motion.div
            key="panel"
            className="relative max-h-[90vh] w-full max-w-[512px] overflow-y-auto rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute start-4 top-4 text-[#667085]"
              aria-label={t('doctor.directory.details.close')}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-5 pb-6 pt-6 sm:px-7">
              <div className="text-start font-cairo text-[24px] font-bold text-[#101828]">
                {t('doctor.directory.details.title')}
              </div>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:gap-6">
                <div className="mx-auto flex h-[112px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[3.65px] border-[#C7F3F1] bg-[#F8FAFC] sm:mx-0 sm:h-[128px] sm:w-[128px]">
                  {doctor.photoUrl ? (
                    <img
                      src={doctor.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-cairo text-[28px] font-extrabold text-[#98A2B3]">
                      {doctor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col items-start gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="font-cairo text-[20px] font-extrabold text-[#111827]">
                      {doctor.name}
                    </div>
                    <span className="inline-flex h-[24px] items-center justify-center gap-2 rounded-full bg-[#00C950] px-4 font-cairo text-[11px] text-[#fff]">
                      {t('doctor.directory.details.verified')}
                      <CircleCheck className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 font-cairo text-[18px] font-semibold text-primary">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    {doctor.specialty}
                  </div>
                  <div className="flex items-center justify-center gap-3 font-cairo text-[13px] font-extrabold text-[#111827]">
                    <span className="flex items-center gap-2">
                      <Star
                        className="h-5 w-5 text-[#FACC15]"
                        fill="#FACC15"
                      />
                      {doctor.rating.toFixed(1)}
                    </span>
                    <span className="font-semibold text-[#98A2B3]">
                      {t('doctor.directory.details.reviewsCount').replace(
                        '{count}',
                        String(doctor.reviews),
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {hasOnline ? (
                      <span className="flex h-[24px] items-center justify-center gap-2 rounded-full border-[1.82px] border-primary bg-[#FFFFFF] px-2 font-cairo text-[12px] font-semibold text-primary">
                        <Video className="h-[12px] w-[12px]" />
                        {t('doctor.directory.details.onlineConsultation')}
                      </span>
                    ) : null}
                    {hasOffline ? (
                      <span className="flex h-[24px] items-center justify-center gap-2 rounded-full border-[1.82px] border-primary bg-primary px-2 font-cairo text-[12px] font-semibold text-[#E9FFFE]">
                        <Building className="h-[12px] w-[12px]" />
                        {t('doctor.directory.details.inPersonConsultation')}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {doctor.bio ? (
                <p className="mt-5 text-start font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                  {doctor.bio}
                </p>
              ) : null}
            </div>

            <div className="h-px w-full bg-[#EEF2F6]" />

            <div className="px-7 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="text-start">
                  <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                    {t('doctor.directory.details.email')}
                  </div>
                  <div
                    className="mt-2 font-cairo text-[12px] font-bold text-[#111827]"
                    dir="ltr"
                  >
                    {doctor.email ?? '—'}
                  </div>
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                        {t('doctor.directory.details.phone')}
                      </p>
                      <p
                        className="mt-1 font-cairo text-[12px] font-bold text-[#111827]"
                        dir="ltr"
                      >
                        {doctor.phone ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {doctor.price != null ? (
                <div className="mt-8 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#16A34A]" />
                  <div>
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {t('doctor.directory.details.consultationPrice')}
                    </div>
                    <span className="font-cairo text-[16px] font-extrabold text-[#16A34A]">
                      {doctor.price}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="h-px w-full bg-[#EEF2F6]" />

            <div className="px-7 py-6">
              <div className="flex items-start justify-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-2">
                  <div className="font-cairo text-[16px] font-extrabold text-[#111827]">
                    {t('doctor.directory.details.clinicLocation')}
                  </div>
                  {doctor.clinicAddress ? (
                    <div className="text-start font-cairo text-[13px] font-semibold text-[#667085]">
                      {doctor.clinicAddress}
                    </div>
                  ) : null}
                  <div className="text-start font-cairo text-[13px] font-semibold text-[#667085]">
                    {doctor.city}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-5 pb-6 sm:grid-cols-2 sm:px-7">
              {doctor.email ? (
                <a
                  href={`mailto:${doctor.email}`}
                  className="flex h-[46px] items-center justify-center gap-2 rounded-[6px] border border-primary bg-white font-cairo text-[13px] font-extrabold text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {t('doctor.directory.details.sendMessage')}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-[46px] items-center justify-center gap-2 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] font-cairo text-[13px] font-extrabold text-[#98A2B3]"
                >
                  <Mail className="h-4 w-4" />
                  {t('doctor.directory.details.sendMessage')}
                </button>
              )}

              {doctor.phone ? (
                <a
                  href={`tel:${doctor.phone}`}
                  className="flex h-[46px] items-center justify-center gap-2 rounded-[6px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[13px] font-extrabold text-white"
                >
                  <Phone className="h-4 w-4" />
                  {t('doctor.directory.details.call')}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-[46px] items-center justify-center gap-2 rounded-[6px] bg-[#E5E7EB] font-cairo text-[13px] font-extrabold text-[#98A2B3]"
                >
                  <Phone className="h-4 w-4" />
                  {t('doctor.directory.details.call')}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
