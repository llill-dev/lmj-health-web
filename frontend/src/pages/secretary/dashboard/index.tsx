import { memo } from "react";
import {
  Users,
  Calendar,
  Check,
  Clock,
  Search,
  Plus,
  UserPlus,
  Activity,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useDoctorAppointmentsApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useDoctorWaitlist } from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

type KpiCard = {
  key: string;
  label: string;
  value: number;
  delta: string;
  icon: typeof Calendar;
  accent: string;
  soft: string;
  iconColor: string;
};

const KpiStatCard = memo<KpiCard>(
  ({ label, value, delta, icon: Icon, accent, soft, iconColor }) => {
    return (
      <article
        className="min-h-[180px] w-full rounded-[16px] border border-[#E7EDF5] bg-white px-4 py-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)] sm:px-5"
        style={{ borderBottomWidth: "4px", borderBottomColor: accent }}
      >
        <div className="flex justify-between items-start gap-5">
          <div className="space-y-4 text-right">
            <div className="font-cairo text-[16px] font-bold leading-[20px] text-[#243044]">
              {label}
            </div>
            <div className="font-cairo text-[30px] font-bold leading-none text-[#1F2937]">
              {value}
            </div>
          </div>
          <div
            className="flex h-[56px] w-[56px] items-center justify-center rounded-[6px]"
            style={{ backgroundColor: soft, color: iconColor }}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-[34px] flex justify-start">
          <span
            className="inline-flex items-center rounded-[10px] px-3 py-1.5 font-cairo text-[13px] font-black"
            style={{ backgroundColor: soft, color: iconColor }}
          >
            {delta}
          </span>
        </div>
      </article>
    );
  },
);

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

function QuickActionCard({
  icon: Icon,
  label,
  variant,
  href,
}: {
  icon: typeof Search;
  label: string;
  variant: "default" | "primary";
  href: string;
}) {
  const baseClasses =
    "flex flex-col items-center justify-center gap-3 rounded-[16px] px-4 py-6 transition-all duration-200 hover:shadow-lg sm:gap-4 sm:px-6 sm:py-8";
  const variantClasses =
    variant === "primary"
      ? "bg-primary text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] hover:bg-primary/90"
      : "bg-white border border-[#E8EEF6] text-[#243044] shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:border-primary/30 hover:bg-[#F8FAFC]";

  return (
    <Link to={href} className={`${baseClasses} ${variantClasses}`}>
      <div
        className={`flex h-[56px] w-[56px] items-center justify-center rounded-[12px] ${
          variant === "primary"
            ? "bg-white/20 text-white"
            : "bg-[#E9F7F6] text-primary"
        }`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <span className="font-cairo text-[15px] font-bold leading-tight">
        {label}
      </span>
    </Link>
  );
}

export default function SecretaryDashboardPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { hasPermission } = useSecretaryPermissions();
  const canViewAppointments = hasPermission("appointments:view");
  const canViewPatients = hasPermission("patients:view");
  const canViewWaitlist = hasPermission("waitlist:view");
  const canCreateTemporaryPatient = hasPermission("patients:temporary:create");
  const canBookAppointment = hasPermission("appointments:book");
  const canViewFiles = hasPermission("patients:files:view");
  const appointmentsQuery = useDoctorAppointmentsApi(
    { page: 1, limit: 4 },
    canViewAppointments,
  );
  const patientsQuery = useDoctorPatients(
    { page: 1, limit: 1 },
    canViewPatients,
  );
  const waitlistQuery = useDoctorWaitlist(
    { page: 1, limit: 1 },
    canViewWaitlist,
  );
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const assignedDoctor = assignedDoctorQuery.assignedDoctor;
  const rating = assignedDoctorQuery.assignedDoctor?.averageRating;

  if (assignedDoctorQuery.isLoading) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="rounded-[20px] border border-[#E8EEF6] bg-white px-6 py-12 text-center font-cairo text-[15px] font-semibold text-[#667085]"
      >
        {tr(
          "جاري تحميل الطبيب المسؤول ولوحة السكرتير...",
          "Loading assigned doctor and secretary dashboard...",
        )}
      </div>
    );
  }

  if (assignedDoctorQuery.isError || !assignedDoctor) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="space-y-4 rounded-[20px] border border-[#F1D6D6] bg-white px-6 py-10 text-center"
      >
        <div className="font-cairo text-[18px] font-black text-[#243044]">
          {tr(
            "تعذر تحميل الطبيب المسؤول حالياً",
            "Assigned doctor is unavailable right now",
          )}
        </div>
        <div className="font-cairo text-[14px] font-semibold text-[#667085]">
          {tr(
            "لا يمكن عرض بيانات المواعيد والمرضى قبل تأكيد ارتباط السكرتير بطبيب مسؤول.",
            "Appointment and patient data stay hidden until the secretary assignment is confirmed.",
          )}
        </div>
        <button
          type="button"
          onClick={() => assignedDoctorQuery.refetch()}
          disabled={assignedDoctorQuery.isRefetching}
          className="inline-flex items-center justify-center rounded-[12px] bg-primary px-4 py-2 font-cairo text-[14px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assignedDoctorQuery.isRefetching
            ? tr("جاري إعادة المحاولة...", "Retrying...")
            : tr("إعادة المحاولة", "Retry")}
        </button>
      </div>
    );
  }

  const kpis: KpiCard[] = [
    {
      key: "today",
      label: tr("مواعيد اليوم", "Today's appointments"),
      value: appointmentsQuery.total ?? 0,
      delta: `${(appointmentsQuery.total ?? 0).toLocaleString(numberLocale)} ${tr("مجدول", "scheduled")}`,
      icon: Calendar,
      accent: "#129A98",
      soft: "#E9F7F6",
      iconColor: "#129A98",
    },
    {
      key: "patients",
      label: tr("المرضى", "Patients"),
      value: patientsQuery.total ?? 0,
      delta: `${(patientsQuery.total ?? 0).toLocaleString(numberLocale)} ${tr("مريض", "patients")}`,
      icon: Users,
      accent: "#2D74F5",
      soft: "#EAF1FF",
      iconColor: "#2D74F5",
    },
    {
      key: "waitlist",
      label: tr("قائمة الانتظار", "Waitlist"),
      value: waitlistQuery.total ?? 0,
      delta: `${(waitlistQuery.total ?? 0).toLocaleString(numberLocale)} ${tr("طلب", "requests")}`,
      icon: Check,
      accent: "#22C55E",
      soft: "#EAFBF0",
      iconColor: "#22C55E",
    },
    {
      key: "available",
      label: tr("الأوقات المتاحة", "Available slots"),
      value: appointmentsQuery.total ?? 0,
      delta: `${(appointmentsQuery.total ?? 0).toLocaleString(numberLocale)} ${tr("موعد", "appointments")}`,
      icon: Clock,
      accent: "#FF6A00",
      soft: "#FFF2E8",
      iconColor: "#FF6A00",
    },
  ];

  const todayAppointments = (appointmentsQuery.appointments ?? []).map((appointment) => ({
    id: appointment._id || appointment.startDateTime || appointment.date || "",
    time: appointment.startTime || "—",
    patientName: appointment.patient?.userId?.fullName || tr("مريض", "Patient"),
    status: appointment.status === "rescheduled" ? "postponed" : appointment.status,
  }));

  const quickActions = [
    {
      icon: Search,
      label: tr("بحث عن مريض", "Search patient"),
      variant: "default" as const,
      href: "/secretary/patients",
      visible: canViewPatients,
    },
    {
      icon: UserPlus,
      label: tr("إضافة مريض مؤقت", "Add temporary patient"),
      variant: "default" as const,
      href: "/secretary/create-temporary-patient",
      visible: canCreateTemporaryPatient,
    },
    {
      icon: Plus,
      label: tr("حجز موعد جديد", "Book new appointment"),
      variant: "primary" as const,
      href: "/secretary/book-appointment",
      visible: canBookAppointment,
    },
  ].filter((item) => item.visible);

  const secondaryStats = [
    {
      key: "rating",
      label: tr("التقييم", "Rating"),
      value: rating != null ? `${rating.toFixed(1)}/5` : "—",
      icon: TrendingUp,
      iconClass: "bg-[#ECFDF3] text-[#22C55E]",
    },
    {
      key: "attendance",
      label: tr("نسبة الحضور", "Attendance rate"),
      value: "—",
      icon: Activity,
      iconClass: "bg-[#F4EBFF] text-[#A855F7]",
    },
    {
      key: "records",
      label: tr("السجلات الطبية", "Medical records"),
      value: "—",
      icon: FileText,
      iconClass: "bg-[#EAF1FF] text-[#3B82F6]",
    },
  ];

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <section className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 xl:gap-8">
        {kpis
          .filter((card) => {
            if (card.key === "today" || card.key === "available") return canViewAppointments;
            if (card.key === "patients") return canViewPatients;
            if (card.key === "waitlist") return canViewWaitlist;
            return true;
          })
          .map((card) => (
          <KpiStatCard
            key={card.key}
            label={card.label}
            value={card.value}
            delta={card.delta}
            icon={card.icon}
            accent={card.accent}
            soft={card.soft}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={index}
            icon={action.icon}
            label={action.label}
            variant={action.variant}
            href={action.href}
          />
        ))}
      </section>

      {assignedDoctorQuery.isRefetching ? (
        <div className="rounded-[14px] border border-[#D8E2EE] bg-white px-4 py-3 text-center font-cairo text-[13px] font-semibold text-[#667085]">
          {tr("جاري تحديث بيانات الطبيب المسؤول...", "Refreshing assigned doctor data...")}
        </div>
      ) : null}

      {canViewAppointments ? (
        <SurfaceSection title={tr("مواعيد اليوم", "Today's appointments")}>
        <div className="space-y-4 px-4 py-5 sm:px-5 sm:py-6">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((row, index) => (
              <article
                key={row.id || `${row.time}-${row.patientName}-${index}`}
                className="flex flex-col gap-4 rounded-[16px] bg-[#F8FAFC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-[45px] w-[45px] items-center justify-center rounded-[10px] bg-primary text-white">
                    <span className="font-cairo text-[20px] font-black">
                      {row.patientName.charAt(0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-cairo text-[18px] font-black text-[#243044]">
                      {row.patientName}
                    </div>
                    <div className="font-cairo text-[14px] font-medium lowercase text-[#98A2B3]">
                      {tr("عيادة", "Clinic")}
                    </div>
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <div className="font-cairo text-[18px] font-black text-[#243044]">
                    {row.time}
                  </div>
                  <div
                    className={`mt-2 inline-flex rounded-[8px] px-3 py-1 font-cairo text-[13px] font-black ${
                      row.status === "completed"
                        ? "bg-[#EAFBF0] text-[#22C55E]"
                        : row.status === "postponed"
                          ? "bg-[#FFF2E8] text-[#FF6A00]"
                          : "bg-[#DDF4F1] text-primary"
                    }`}
                  >
                    {row.status === "completed"
                      ? tr("مكتمل", "Completed")
                      : row.status === "postponed"
                        ? tr("مؤجل", "Postponed")
                        : tr("مجدول", "Scheduled")}
                  </div>
                </div>
              </article>
            ))
          ) : appointmentsQuery.isAwaitingData ? (
            <div className="py-8 text-center font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {tr("جاري تحميل مواعيد اليوم...", "Loading today's appointments...")}
            </div>
          ) : (
            <div className="flex min-h-[250px] items-center justify-center rounded-[18px] border border-dashed border-[#D8E2EE] bg-[#FBFDFE] px-6 text-center font-cairo text-[15px] font-semibold leading-7 text-[#8A94A6]">
              {tr("لا توجد مواعيد مجدولة لهذا اليوم بعد.", "No appointments scheduled for today yet.")}
            </div>
          )}
        </div>
      </SurfaceSection>
      ) : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
        {secondaryStats
          .filter((card) => {
            if (card.key === "records") return canViewFiles;
            return true;
          })
          .map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-[10px] bg-[#FFFFFF] px-4 py-5 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_0px_rgba(0,0,0,0.10)] sm:px-6 sm:py-6 lg:px-8 lg:py-8"
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="font-cairo text-[22px] font-black text-[#243044]">
                    {card.value}
                  </div>
                  <div className="mt-2 font-cairo text-[18px] font-semibold text-[#98A2B3]">
                    {card.label}
                  </div>
                </div>
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-[16px] ${card.iconClass}`}
                >
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
