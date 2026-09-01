import { Helmet } from "react-helmet-async";
import { ArrowRight, CalendarDays, Eye, Stethoscope } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { SecretaryDoctorAppointmentsPanel } from "@/components/admin/secretaries/SecretaryDoctorAppointmentsPanel";
import { useAdminSecretaryById } from "@/hooks/admin/secretaries/useAdminSecretaryById";
import { useI18n } from "@/i18n/provider";

export default function AdminSecretaryAppointmentsPage() {
  const { secretaryId = "" } = useParams();
  const { t, locale, dir } = useI18n();
  const { secretaryName, doctorName, assignedDoctorId, isAwaitingData } =
    useAdminSecretaryById(secretaryId, t);

  return (
    <>
      <Helmet>
        <title>
          {t("admin.secretaryAppointments.page.title")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <Link
          to={`/admin/secretaries/${secretaryId}`}
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          {t("admin.secretaryAppointments.backToProfile")}
        </Link>

        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.secretaryAppointments.overview.title")}
          subtitle={
            isAwaitingData
              ? t("admin.secretaryAppointments.overview.subtitle.loading")
              : t("admin.secretaryAppointments.overview.subtitle", {
                  secretaryName,
                  doctorName,
                })
          }
          headerIcon={<CalendarDays className="h-8 w-8 text-white" />}
        />

        <section className="mt-5 rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3 text-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t("admin.secretaryAppointments.info.title")}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#667085]">
                {t("admin.secretaryAppointments.info.description")}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
              {t("admin.secretaryAppointments.cards.doctor")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Stethoscope className="h-4 w-4 text-primary" />
              {doctorName || t("admin.secretaryAppointments.cards.notSet")}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
              {t("admin.secretaryAppointments.cards.scope")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Eye className="h-4 w-4 text-primary" />
              {t("admin.secretaryAppointments.cards.scopeValue")}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
              {t("admin.secretaryAppointments.cards.action")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <CalendarDays className="h-4 w-4 text-primary" />
              {t("admin.secretaryAppointments.cards.actionValue")}
            </div>
          </div>
        </section>

        <SecretaryDoctorAppointmentsPanel
          assignedDoctorId={assignedDoctorId}
          doctorName={doctorName}
          mode="view"
        />
      </div>
    </>
  );
}
