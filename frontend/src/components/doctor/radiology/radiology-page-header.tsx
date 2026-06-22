import { ChevronLeft, ScanLine, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildRadiologyPatientSubtitle } from './map-radiology-ui';

export function RadiologyPageHeader({
  patientName,
  fileNumber,
  statusLabel = 'مسودة',
  backTo = '/doctor/radiology',
  title = 'طلبات الأشعة',
  subtitle,
  icon: Icon = ScanLine,
}: {
  patientName?: string;
  fileNumber?: string;
  statusLabel?: string;
  backTo?: string;
  title?: string;
  /** إن لم يُمرَّر يُستخدم نص الأشعة الافتراضي */
  subtitle?: string;
  icon?: LucideIcon;
}) {
  const resolvedSubtitle =
    subtitle ?? buildRadiologyPatientSubtitle(patientName);

  return (
    <section className="relative mb-6 overflow-hidden rounded-[6px] px-4 py-6 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div
          dir="rtl"
          className="flex min-w-0 flex-1 items-start justify-start gap-3 text-start sm:gap-4"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)] sm:h-16 sm:w-16">
            <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" aria-hidden />
          </div>
          <div className="min-w-0 text-start">
            <h1 className="font-cairo text-[26px] font-black leading-[32px] text-primary sm:text-[30px] sm:leading-[36px]">
              {title}
            </h1>
            <p className="mt-1 font-cairo text-[14px] font-bold leading-[22px] text-primary/90 sm:text-[16px]">
              {resolvedSubtitle}
            </p>
            {fileNumber ? (
              <p className="mt-0.5 font-cairo text-[12px] font-semibold text-primary/75">
                رقم الملف: {fileNumber}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 font-cairo text-[13px] font-extrabold text-primary transition hover:text-[#0A7A77]"
          >
            <span>رجوع</span>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
          <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 font-cairo text-[11px] font-extrabold text-[#B45309]">
            {statusLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
