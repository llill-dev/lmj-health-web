import { ChevronDown, Loader2, WifiOff } from "lucide-react";
import { useI18n } from "@/i18n/provider";

type DoctorListErrorStateProps = {
  title: string;
  brief: string;
  detail?: string;
  showTechnicalDetail?: boolean;
  retryLabel?: string;
  retrying?: boolean;
  onRetry: () => void;
};

export default function DoctorListErrorState({
  title,
  brief,
  detail,
  showTechnicalDetail = false,
  retryLabel,
  retrying = false,
  onRetry,
}: DoctorListErrorStateProps) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const resolvedRetryLabel = retryLabel ?? tr("إعادة المحاولة", "Retry");

  return (
    <div
      dir={dir}
      lang={locale}
      role="alert"
      className="flex min-h-[360px] items-center justify-center px-3 py-10 sm:px-4"
    >
      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFFFE] via-white to-[#F8FAFC] px-6 pb-10 pt-9 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.14)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#0F766E]/90 via-primary to-[#5EEAD4]"
        />
        <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[#E6F7F6] bg-white shadow-[0_14px_32px_rgba(15,143,139,0.14)]">
          <WifiOff
            className="h-[26px] w-[26px] text-primary"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <h2 className="mt-5 font-cairo text-[clamp(1.05rem,2.8vw,1.2rem)] font-black tracking-tight text-[#101828]">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-[34ch] font-cairo text-[13px] font-semibold leading-[1.7] text-[#475467]">
          {brief}
        </p>
        {showTechnicalDetail && detail ? (
          <details className="group mt-5 rounded-2xl border border-[#EAECF0] bg-white/75 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[2px]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-cairo text-[12px] font-extrabold text-[#344054] transition-colors hover:text-[#101828] [&::-webkit-details-marker]:hidden">
              <span>{tr("تفاصيل إضافية", "Additional details")}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#98A2B3] transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-3 border-t border-[#F2F4F7] pt-3 text-right font-cairo text-[12px] font-medium leading-[1.75] text-[#667085]">
              {detail}
            </p>
          </details>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-7 inline-flex h-[44px] min-w-[180px] items-center justify-center gap-2 rounded-[14px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.22)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#0d7d76] hover:shadow-[0_14px_32px_rgba(15,143,139,0.26)] active:translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:pointer-events-none disabled:opacity-60"
        >
          {retrying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {resolvedRetryLabel}
        </button>
      </div>
    </div>
  );
}
