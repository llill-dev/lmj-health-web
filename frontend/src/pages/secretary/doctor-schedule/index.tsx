import { Calendar, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { get } from "@/lib/api";
import { useI18n } from "@/i18n/provider";

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
  isHoliday,
  holidayLabel,
  closedLabel,
  availableLabel,
}: {
  day: string;
  timeRange: string;
  isAvailable: boolean;
  isHoliday?: boolean;
  holidayLabel: string;
  closedLabel: string;
  availableLabel: string;
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
            {isHoliday ? holidayLabel : timeRange}
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
        {isHoliday ? closedLabel : availableLabel}
      </span>
    </div>
  );
}

export default function SecretaryDoctorSchedulePage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const doctorId = assignedDoctorQuery.assignedDoctor?._id ?? "";
  const doctorName =
    assignedDoctorQuery.assignedDoctor?.userId?.fullName ||
    tr("الطبيب المسؤول", "Assigned doctor");
  const scheduleQuery = useQuery({
    queryKey: ["secretary", "doctor-schedule", doctorId],
    enabled: Boolean(doctorId),
    queryFn: () =>
      get<{
        availableTimes?: Array<{
          day?: string;
          slots?: Array<{ startTime?: string; endTime?: string }>;
        }>;
      }>(`/api/doctors/${doctorId}/schedule`),
    staleTime: 60_000,
  });

  const dayLabels: Record<string, string> = {
    Sunday: tr("الأحد", "Sunday"),
    Monday: tr("الاثنين", "Monday"),
    Tuesday: tr("الثلاثاء", "Tuesday"),
    Wednesday: tr("الأربعاء", "Wednesday"),
    Thursday: tr("الخميس", "Thursday"),
    Friday: tr("الجمعة", "Friday"),
    Saturday: tr("السبت", "Saturday"),
  };

  const scheduleDays = Object.entries(dayLabels).map(([key, label]) => {
    const dayEntry = scheduleQuery.data?.availableTimes?.find(
      (entry) => entry.day === key,
    );
    const firstSlot = dayEntry?.slots?.[0];
    return {
      day: label,
      timeRange:
        firstSlot?.startTime && firstSlot?.endTime
          ? `${firstSlot.startTime} - ${firstSlot.endTime}`
          : "—",
      isAvailable: Boolean(firstSlot?.startTime && firstSlot?.endTime),
      isHoliday: !firstSlot?.startTime || !firstSlot?.endTime,
    };
  });

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title={tr("جدول عمل الطبيب", "Doctor work schedule")}>
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-6 text-right">
            <h3 className="font-cairo text-[18px] font-bold text-[#243044]">
              {tr("جدول الأسبوع الحالي", "Current week schedule")}
            </h3>
            <p className="mt-1 font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {doctorName}
              {scheduleQuery.isRefetching
                ? tr(" • جاري تحديث البيانات", " • Refreshing data")
                : ""}
            </p>
          </div>

          {assignedDoctorQuery.isLoading ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {tr(
                "جاري تحميل بيانات الطبيب المسؤول...",
                "Loading assigned doctor...",
              )}
            </div>
          ) : assignedDoctorQuery.isError ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              <p>
                {tr(
                  "تعذر تحميل الطبيب المسؤول حالياً، لذلك لا يمكن عرض الجدول.",
                  "Assigned doctor could not be loaded, so the schedule cannot be shown right now.",
                )}
              </p>
              <button
                type="button"
                onClick={() => void assignedDoctorQuery.refetch()}
                disabled={assignedDoctorQuery.isRefetching}
                className="mt-3 rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assignedDoctorQuery.isRefetching
                  ? tr("جاري إعادة المحاولة...", "Retrying...")
                  : tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : !doctorId ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {tr(
                "لا يوجد طبيب مسؤول مرتبط بهذا الحساب حالياً، لذلك لا يمكن عرض الجدول.",
                "No assigned doctor is linked to this account right now, so the schedule cannot be shown.",
              )}
            </div>
          ) : scheduleQuery.isLoading ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {tr("جاري تحميل جدول الطبيب...", "Loading doctor schedule...")}
            </div>
          ) : scheduleQuery.isError ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              <p>
                {tr(
                  "تعذر تحميل جدول الطبيب حالياً.",
                  "Could not load the doctor schedule right now.",
                )}
              </p>
              <button
                type="button"
                onClick={() => void scheduleQuery.refetch()}
                disabled={scheduleQuery.isRefetching}
                className="mt-3 rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {scheduleQuery.isRefetching
                  ? tr("جاري إعادة المحاولة...", "Retrying...")
                  : tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleDays.map((schedule) => (
                <ScheduleDayCard
                  key={schedule.day}
                  day={schedule.day}
                  timeRange={schedule.timeRange}
                  isAvailable={schedule.isAvailable}
                  isHoliday={schedule.isHoliday}
                  holidayLabel={tr("عطلة", "Holiday")}
                  closedLabel={tr("مغلق", "Closed")}
                  availableLabel={tr("متاح", "Available")}
                />
              ))}
            </div>
          )}
        </div>
      </SurfaceSection>
    </div>
  );
}
