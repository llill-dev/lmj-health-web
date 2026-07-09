import { memo } from "react";
import { Calendar, Clock, Check, X } from "lucide-react";

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function ScheduleDayCard({
  day,
  timeRange,
  isAvailable,
  isHoliday,
}: {
  day: string;
  timeRange: string;
  isAvailable: boolean;
  isHoliday?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${
            isHoliday
              ? "bg-[#FEE2E2] text-[#B42318]"
              : "bg-[#E9F7F6] text-primary"
          }`}
        >
          {isHoliday ? (
            <X className="h-6 w-6" />
          ) : (
            <Calendar className="h-6 w-6" />
          )}
        </div>
        <div className="text-right">
          <div className="font-cairo text-[18px] font-black text-[#243044]">
            {day}
          </div>
          <div className="font-cairo text-[14px] font-semibold text-[#98A2B3]">
            {isHoliday ? "عطلة" : timeRange}
          </div>
        </div>
      </div>
      <span
        className={`inline-flex rounded-[8px] px-3 py-1.5 font-cairo text-[13px] font-black ${
          isHoliday
            ? "bg-[#FEE2E2] text-[#B42318]"
            : "bg-[#EAFBF0] text-[#22C55E]"
        }`}
      >
        {isHoliday ? "مغلق" : "متاح"}
      </span>
    </div>
  );
}

export default function SecretaryDoctorSchedulePage() {
  const scheduleDays = [
    { day: "السبت", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الأحد", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الاثنين", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الثلاثاء", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الأربعاء", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الخميس", timeRange: "09:00 - 17:00", isAvailable: true },
    { day: "الجمعة", timeRange: "—", isAvailable: false, isHoliday: true },
  ];

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="جدول عمل الطبيب">
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-6 text-right">
            <h3 className="font-cairo text-[18px] font-bold text-[#243044]">
              جدول الأسبوع الحالي
            </h3>
            <p className="mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]">
              د. خالد عبد الله
            </p>
          </div>

          <div className="space-y-3">
            {scheduleDays.map((schedule) => (
              <ScheduleDayCard
                key={schedule.day}
                day={schedule.day}
                timeRange={schedule.timeRange}
                isAvailable={schedule.isAvailable}
                isHoliday={schedule.isHoliday}
              />
            ))}
          </div>
        </div>
      </SurfaceSection>
    </div>
  );
}
