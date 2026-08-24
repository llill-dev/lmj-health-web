import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

export function PrescriptionsHubPageHeader({
  addHref = "/doctor/encounters",
}: {
  addHref?: string;
}) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

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
              {tr("الوصفات الطبية", "Prescriptions")}
            </h1>
            <p className="mt-1 font-cairo text-[14px] font-bold leading-[22px] text-primary/90 sm:text-[16px]">
              {tr("توثيق الوصفات", "Prescription documentation")}
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
              {tr("إضافة وصفة جديدة", "Add new prescription")}
            </span>
          </Link>
          <p className="max-w-[220px] text-end font-cairo text-[11px] font-semibold leading-relaxed text-primary/80">
            {tr(
              "تُنشأ الوصفة من داخل زيارة المريض — سننقلك إلى قائمة الزيارات لاختيار الزيارة أولاً.",
              "Prescriptions are created from within a patient visit — you'll be taken to the encounters list to pick one first.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
