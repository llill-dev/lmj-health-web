import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

export function PrescriptionsHubPageHeader({
  addHref = "/doctor/encounters",
}: {
  addHref?: string;
}) {
  const { dir, locale, t } = useI18n();

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative mb-6 overflow-hidden rounded-[6px] px-4 py-6 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start justify-start gap-3 text-start sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)] sm:h-16 sm:w-16">
            <FileText
              className="h-7 w-7 text-white sm:h-8 sm:w-8"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-cairo text-[26px] font-black leading-[32px] text-primary sm:text-[30px] sm:leading-[36px]">
              {t("doctor.prescriptionsHub.pageTitle")}
            </h1>
            <p className="mt-1 font-cairo text-[14px] font-bold leading-[22px] text-primary/90 sm:text-[16px]">
              {t("doctor.prescriptionsHub.pageSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-end gap-1.5 sm:w-auto">
          <Link
            to={addHref}
            className="inline-flex h-[48px] w-full min-w-0 items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:border-primary/30 hover:bg-[#F0FDFA] sm:w-auto sm:min-w-[168px]"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">
              {t("doctor.prescriptionsHub.addNewPrescription")}
            </span>
          </Link>
          <p className="max-w-[220px] text-end font-cairo text-[11px] font-semibold leading-relaxed text-primary/80">
            {t("doctor.prescriptionsHub.addHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
