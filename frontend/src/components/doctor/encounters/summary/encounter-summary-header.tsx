import { Users } from 'lucide-react';

export function EncounterSummaryHeader() {
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
      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)] sm:h-16 sm:w-16">
          <Users className="h-7 w-7 text-white sm:h-8 sm:w-8" aria-hidden />
        </div>
        <div className="text-start">
          <h1 className="font-cairo text-[24px] font-black leading-[30px] text-primary sm:text-[30px] sm:leading-[36px]">
            ملخص الزيارة الطبية
          </h1>
          <p className="mt-1 font-cairo text-[14px] leading-[22px] text-primary/85 sm:text-[16px] sm:leading-[24px]">
            مراجعة التوثيق السريري بعد إغلاق الزيارة
          </p>
        </div>
      </div>
    </section>
  );
}
