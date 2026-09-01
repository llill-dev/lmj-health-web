import {
  Mail,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  UserRound,
  Briefcase,
} from "lucide-react";
import { readAuthUser } from "@/lib/cookies";
import { useDoctorAppointmentsApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { secretaryPermissionLabel } from "@/lib/doctor/secretaries/permissionsUi";
import { useI18n } from "@/i18n/provider";

function SurfaceSection({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: typeof UserRound;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E9F7F6] text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
            {title}
          </h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:px-8 lg:py-5">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#E9F7F6] text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <div className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
          {label}
        </div>
        <div className="mt-1 font-cairo text-[16px] font-bold text-[#243044]">
          {value}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Calendar;
}) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-5 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_0px_rgba(0,0,0,0.10)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <div className="text-start">
          <div className="font-cairo text-[22px] font-black text-[#243044]">
            {value}
          </div>
          <div className="mt-2 font-cairo text-[18px] font-semibold text-[#98A2B3]">
            {label}
          </div>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#E9F7F6] text-primary">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function PermissionBadge({ permission }: { permission: string }) {
  return (
    <span className="inline-flex items-center rounded-[8px] bg-[#E9F7F6] px-3 py-1.5 font-cairo text-[13px] font-black text-primary">
      {permission}
    </span>
  );
}

export default function SecretaryProfilePage() {
  const { locale, dir, t } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const authUser = readAuthUser();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const secretaryPermissions = useSecretaryPermissions();
  const canViewAppointments =
    secretaryPermissions.hasPermission("appointments:view");
  const canViewPatients = secretaryPermissions.hasPermission("patients:view");
  const appointmentsQuery = useDoctorAppointmentsApi(
    { page: 1, limit: 1 },
    canViewAppointments,
  );
  const patientsQuery = useDoctorPatients(
    { page: 1, limit: 1 },
    canViewPatients,
  );
  const secretaryName =
    authUser?.fullName?.trim() || t("secretary.profile.secretaryFallback");
  const secretaryEmail = authUser?.email?.trim() || "—";
  const secretaryPhone = authUser?.phone?.trim() || "—";
  const assignedDoctor = assignedDoctorQuery.assignedDoctor;
  const initial =
    secretaryName.trim().charAt(0).toUpperCase() ||
    t("secretary.profile.initialFallback");

  const contactInfo = [
    { label: t("secretary.profile.email"), value: secretaryEmail, icon: Mail },
    { label: t("secretary.profile.phone"), value: secretaryPhone, icon: Phone },
    { label: t("secretary.profile.address"), value: "—", icon: MapPin },
  ];

  const doctorInfo = [
    {
      label: t("secretary.profile.doctorName"),
      value:
        assignedDoctor?.user?.fullName ||
        assignedDoctor?.userId?.fullName ||
        "—",
    },
    {
      label: t("secretary.profile.specialty"),
      value: assignedDoctor?.specialization || "—",
    },
    {
      label: t("secretary.profile.rating"),
      value: `${assignedDoctor?.averageRating ?? "—"}`,
    },
  ];

  // Attendance-rate has no backend contract for the secretary's own profile
  // (docs/openapi.json exposes no such field or self-stats endpoint) — the
  // card is omitted entirely rather than showing a developer-facing
  // placeholder string, per manual-QA feedback.
  const stats = [
    {
      label: t("secretary.profile.appointments"),
      value: canViewAppointments ? (appointmentsQuery.total ?? 0) : "—",
      icon: Briefcase,
    },
    {
      label: t("secretary.profile.patients"),
      value: canViewPatients ? (patientsQuery.total ?? 0) : "—",
      icon: UserRound,
    },
  ];

  const permissions = secretaryPermissions.permissions.map((permission) =>
    secretaryPermissionLabel(permission, tr),
  );
  const unsupportedPermissions = secretaryPermissions.unsupportedPermissions;

  return (
    <div dir={dir} lang={locale} className="space-y-5 pb-8 sm:pb-10">
      <SurfaceSection
        title={t("secretary.profile.personalInfo")}
        icon={UserRound}
      >
        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex items-center gap-4 rounded-[18px] bg-[#F8FAFC] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[24px] font-black text-white shadow-[0_12px_28px_rgba(15,143,139,0.32)]">
              {initial}
            </div>
            <div className="flex-1">
              <div className="font-cairo text-[24px] font-black text-[#243044]">
                {secretaryName}
              </div>
              <div className="mt-1 font-cairo text-[16px] font-semibold text-[#98A2B3]">
                {t("secretary.profile.secretary")}
              </div>
            </div>
            <div className="text-start">
              <div className="inline-flex items-center rounded-[8px] bg-[#ECFDF3] px-3 py-1.5 font-cairo text-[13px] font-black text-[#16A34A]">
                <ShieldCheck className="ms-2 h-4 w-4" />
                {t("secretary.profile.active")}
              </div>
            </div>
          </div>
        </div>

        {contactInfo.map((info, index) => (
          <InfoRow
            key={index}
            label={info.label}
            value={info.value}
            icon={info.icon}
          />
        ))}
      </SurfaceSection>

      <SurfaceSection
        title={t("secretary.profile.assignedDoctor")}
        icon={Briefcase}
      >
        {assignedDoctorQuery.isLoading ? (
          <div className="px-4 py-6 text-center font-cairo text-[14px] font-semibold text-[#667085] sm:px-6 lg:px-8">
            {t("secretary.profile.loadingDoctor")}
          </div>
        ) : assignedDoctorQuery.isError || !assignedDoctor ? (
          <div className="space-y-4 px-4 py-6 text-center sm:px-6 lg:px-8">
            <div className="font-cairo text-[15px] font-bold text-[#243044]">
              {t("secretary.profile.doctorLoadError")}
            </div>
            <button
              type="button"
              onClick={() => assignedDoctorQuery.refetch()}
              disabled={assignedDoctorQuery.isRefetching}
              className="inline-flex items-center justify-center rounded-[12px] bg-primary px-4 py-2 font-cairo text-[14px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assignedDoctorQuery.isRefetching
                ? t("secretary.profile.retrying")
                : t("secretary.profile.retry")}
            </button>
          </div>
        ) : (
          <>
            {doctorInfo.map((info, index) => (
              <InfoRow key={index} label={info.label} value={info.value} />
            ))}
            {assignedDoctorQuery.isRefetching ? (
              <div className="border-t border-[#EEF2F6] px-4 py-4 text-center font-cairo text-[13px] font-semibold text-[#667085] sm:px-6 lg:px-8">
                {t("secretary.profile.refreshingDoctor")}
              </div>
            ) : null}
          </>
        )}
      </SurfaceSection>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <SurfaceSection
        title={t("secretary.profile.permissions")}
        icon={ShieldCheck}
      >
        <div className="flex flex-wrap gap-3 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {permissions.length > 0 ? (
            permissions.map((permission) => (
              <PermissionBadge key={permission} permission={permission} />
            ))
          ) : (
            <span className="font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {t("secretary.profile.noPermissions")}
            </span>
          )}
        </div>
        {unsupportedPermissions.length > 0 ? (
          <div className="border-t border-[#EEF2F6] px-4 py-4 sm:px-6 lg:px-8">
            <span className="font-cairo text-[13px] font-semibold text-[#B54708]">
              {t("secretary.profile.unsupportedPermissions")}
            </span>
          </div>
        ) : null}
      </SurfaceSection>

      {/*
        "Account information" (last login / registration date) was removed:
        no backend contract exposes these fields for a secretary's own
        profile (checked docs/openapi.json — /api/secretaries/{id} is
        doctor-only, and /api/secretaries/me/doctor returns the assigned
        doctor, not the secretary's own account). Re-add this section if a
        real endpoint/field becomes available.
      */}
    </div>
  );
}
