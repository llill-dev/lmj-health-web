import { Check, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildRadiologyPatientSubtitle } from '../map-radiology-ui';
import { useI18n } from '@/i18n/provider';

export function RadiologyPreviewBanner({
  patientName,
  statusLabel,
  backTo = '/doctor/radiology',
  loading = false,
}: {
  patientName?: string;
  statusLabel?: string;
  backTo?: string;
  loading?: boolean;
}) {
  const { t } = useI18n();
  const resolvedStatusLabel =
    statusLabel ?? t('doctor.radiologyPreviewBanner.defaultStatus');
  const subtitle = loading
    ? t('doctor.radiologyPreviewBanner.loadingPatient')
    : buildRadiologyPatientSubtitle(patientName, t);

  return (
    <section className="relative mb-6 overflow-hidden rounded-[6px] px-4 py-6 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 text-start sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)] sm:h-16 sm:w-16">
            <Check className="h-7 w-7 text-white sm:h-8 sm:w-8" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="font-cairo text-[26px] font-black text-primary sm:text-[30px]">
              {t('doctor.radiologyPreviewBanner.title')}
            </h1>
            <p className="mt-1 font-cairo text-[14px] font-bold text-primary/90">{subtitle}</p>
            {!loading && patientName?.trim() ? (
              <p className="mt-0.5 font-cairo text-[13px] font-semibold text-primary/75">
                {t('doctor.radiologyPreviewBanner.confirmBeforeSending')}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 font-cairo text-[13px] font-extrabold text-primary"
          >
            <span>{t('doctor.radiologyPreviewBanner.back')}</span>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#B45309]">
            {resolvedStatusLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
