/**
 * Skeleton لرأس صفحة المريض أثناء التحميل
 */

export function PatientHeaderSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/95 bg-white shadow-[0_28px_64px_-18px_rgba(15,143,139,0.14),0_8px_24px_rgba(15,23,42,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#5eead4] via-primary to-[#0f766e]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 65% at 100% 0%, rgba(15,143,139,0.11), transparent 52%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(20,184,166,0.09), transparent 48%), linear-gradient(165deg, #ffffff 0%, #f8fdfc 42%, #f1faf9 100%)",
        }}
      />

      <div
        className="relative px-5 py-7 sm:px-8 sm:py-8"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">جارٍ تحميل تفاصيل المريض…</span>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-1 gap-5 items-start min-w-0 sm:gap-6">
            <div className="h-[76px] w-[76px] animate-pulse rounded-[22px] bg-gradient-to-br from-[#E5E7EB] to-[#F3F4F6]" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-3 w-24 animate-pulse rounded-md bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
              <div className="h-7 w-48 animate-pulse rounded-lg bg-gradient-to-r from-[#D1D5DB] to-[#E5E7EB]" />
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-28 animate-pulse rounded-xl bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6]" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-auto lg:grid-cols-2">
            <div className="h-[110px] animate-pulse rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]" />
            <div className="h-[110px] animate-pulse rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]" />
          </div>
        </div>
      </div>
    </section>
  );
}
