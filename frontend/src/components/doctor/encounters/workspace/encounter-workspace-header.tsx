import { Users } from 'lucide-react';

export function EncounterWorkspaceHeader({
  doctorName,
}: {
  doctorName: string;
}) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[6px] px-8 py-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]">
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#E6F4F3]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px] bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[6px] bg-primary shadow-[0px_4px_14px_rgba(15,143,139,0.35)]">
          <Users className="h-8 w-8 text-white" aria-hidden />
        </div>
        <div className="text-right">
          <h1 className="font-cairo text-[30px] font-black leading-[36px] text-primary">
            الزيارة الطبية
          </h1>
          <p className="mt-1 font-cairo text-[16px] leading-[24px] text-primary/85">
            متابعة التوثيق السريري للمريض — {doctorName}
          </p>
        </div>
      </div>
    </section>
  );
}
