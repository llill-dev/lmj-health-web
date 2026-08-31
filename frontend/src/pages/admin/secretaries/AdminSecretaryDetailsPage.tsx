import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  Lock,
  Mail,
  Phone,
  Settings,
  Stethoscope,
  UserMinus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAdminSecretariesList } from "@/hooks/admin/secretaries/useAdminSecretaries";
import OffboardDialog from "@/components/admin/secretaries/dialogs/OffboardDialog";
import {
  PERM_GROUPS,
  permLabel,
} from "@/components/admin/secretaries/secretaryPermissions";
import { getTranslationValue } from "@/i18n/translations";
import type { AdminSecretarySummary } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminSecretaryDetailsPage() {
  const { secretaryId } = useParams<{ secretaryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale, dir } = useI18n();

  /* Try state first, then fallback to fetching list */
  const locationSecretary = (
    location.state as { secretary?: AdminSecretarySummary }
  )?.secretary;
  const { data: listData, isAwaitingData } = useAdminSecretariesList({
    limit: 100,
  });
  const secretary: AdminSecretarySummary | undefined =
    locationSecretary ??
    listData?.secretaries.find((s) => s._id === secretaryId);

  const [offboardOpen, setOffboardOpen] = useState(false);
  const userId = secretary?.userId ?? secretary?.user?._id ?? null;

  const perms = secretary?.permissions ?? [];

  return (
    <>
      <Helmet>
        <title>
          {secretary?.user?.fullName
            ? `${secretary.user.fullName} • LMJ Health`
            : `${t("admin.secretaryDetails.page.title")} • LMJ Health`}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        {/* breadcrumb */}
        <button
          type="button"
          onClick={() => navigate("/admin/secretaries")}
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          {t("admin.secretaryDetails.backToList")}
        </button>

        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-md">
              <Users className="h-8 w-8" />
            </div>
            <div>
              {isAwaitingData && !secretary ? (
                <>
                  <div className="h-6 w-48 animate-pulse rounded bg-[#EEF2F6]" />
                  <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#EEF2F6]" />
                </>
              ) : (
                <>
                  <div className="font-cairo text-[24px] font-black leading-[30px] text-[#111827]">
                    {secretary?.user?.fullName ?? "—"}
                  </div>
                  <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                    {t("admin.secretaryDetails.accountLabel")} {secretaryId}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#667085]">
              <Eye className="h-4 w-4" />
              {t("admin.secretaryDetails.badge.readOnly")}
            </span>
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/secretaries/${secretaryId}/appointments`, {
                  state: location.state,
                })
              }
              className="h-9 rounded-[10px] border border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary hover:bg-[#E7FBFA]"
            >
              <CalendarDays className="me-1.5 inline h-4 w-4" />
              {t("admin.secretaryDetails.actions.appointments")}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/secretaries/${secretaryId}/appointments/manage`,
                  { state: location.state },
                )
              }
              className="h-9 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white hover:bg-primary/90"
            >
              {t("admin.secretaryDetails.actions.manageAppointments")}
            </button>
            {userId && (
              <button
                type="button"
                onClick={() => setOffboardOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <UserMinus className="h-4 w-4" />
                {t("admin.secretaryDetails.actions.offboard")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" />
            <div>
              <div className="font-cairo text-sm font-extrabold text-[#991B1B]">
                {t("admin.secretaryDetails.permissions.title")}
              </div>
              <div className="mt-1 font-cairo text-sm font-semibold leading-6 text-[#B42318]">
                {t("admin.secretaryDetails.permissions.description")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {t("admin.secretaryDetails.cards.recordType")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Users className="h-4 w-4 text-primary" />
              {t("admin.secretaryDetails.cards.secretaryProfile")}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {t("admin.secretaryDetails.cards.linkedDoctor")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Stethoscope className="h-4 w-4 text-primary" />
              {secretary?.doctor?.user?.fullName ??
                t("admin.secretaryDetails.cards.notLinked")}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {t("admin.secretaryDetails.cards.pageScope")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Eye className="h-4 w-4 text-primary" />
              {t("admin.secretaryDetails.cards.reviewProfile")}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {t("admin.secretaryDetails.cards.currentAction")}
            </div>
            <div className="mt-2 flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
              <Settings className="h-4 w-4 text-primary" />
              {userId
                ? t("admin.secretaryDetails.cards.offboardOrAppointments")
                : t("admin.secretaryDetails.cards.referenceOnly")}
            </div>
          </div>
        </div>

        {/* ── content grid ── */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* left: contact + doctor */}
          <div className="flex flex-col gap-5">
            {/* contact info */}
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-sm font-extrabold text-[#111827]">
                {t("admin.secretaryDetails.contact.title")}
              </h3>
              <div className="space-y-3">
                {secretary?.user?.email && (
                  <div className="flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3">
                    <div className="flex items-center gap-2 text-[#667085]">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="font-cairo text-[13px] font-bold">
                        {t("admin.secretaryDetails.contact.email")}
                      </span>
                    </div>
                    <span className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {secretary.user.email}
                    </span>
                  </div>
                )}
                {secretary?.user?.phone && (
                  <div className="flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3">
                    <div className="flex items-center gap-2 text-[#667085]">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-cairo text-[13px] font-bold">
                        {t("admin.secretaryDetails.contact.phone")}
                      </span>
                    </div>
                    <span className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {secretary.user.phone}
                    </span>
                  </div>
                )}
                {secretary?.user?.gender && (
                  <div className="flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3">
                    <span className="font-cairo text-[13px] font-bold text-[#667085]">
                      {t("admin.secretaryDetails.contact.gender")}
                    </span>
                    <span className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {secretary.user.gender === "Female"
                        ? t("admin.secretaryDetails.contact.female")
                        : t("admin.secretaryDetails.contact.male")}
                    </span>
                  </div>
                )}
                {!secretary?.user?.email &&
                  !secretary?.user?.phone &&
                  !isAwaitingData && (
                    <div className="font-cairo text-[13px] text-[#98A2B3]">
                      {t("admin.secretaryDetails.contact.noDetails")}
                    </div>
                  )}
              </div>
            </div>

            {/* assigned doctor */}
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-sm font-extrabold text-[#111827]">
                {t("admin.secretaryDetails.assignedDoctor.title")}
              </h3>
              {secretary?.doctor ? (
                <div className="rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white shadow-sm">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-cairo text-sm font-extrabold text-[#111827]">
                        {secretary.doctor.user?.fullName ?? "—"}
                      </div>
                      {secretary.doctor.specialization && (
                        <div className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                          {secretary.doctor.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[10px] font-extrabold ${
                        secretary.doctor.approvalStatus === "approved"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : "bg-[#FEF3C7] text-[#D97706]"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {secretary.doctor.approvalStatus === "approved"
                        ? t("admin.secretaryDetails.assignedDoctor.approved")
                        : t(
                            "admin.secretaryDetails.assignedDoctor.notApproved",
                          )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-[10px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-5 text-center font-cairo text-[13px] text-[#98A2B3]">
                  {t("admin.secretaryDetails.assignedDoctor.notLinked")}
                </div>
              )}
            </div>
          </div>

          {/* right: permissions (spans 2 cols) */}
          <div className="xl:col-span-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-cairo text-sm font-extrabold text-[#111827]">
                {t("admin.secretaryDetails.permissions.granted")}
              </h3>
              <span className="rounded-full bg-[#E7FBFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary">
                {perms.length} {t("admin.secretaryDetails.permissions.count")}
              </span>
            </div>

            {perms.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Settings className="h-8 w-8 text-[#D0D5DD]" />
                <span className="font-cairo text-[13px] font-bold text-[#98A2B3]">
                  {t("admin.secretaryDetails.permissions.noPermissions")}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PERM_GROUPS.map(
                  ({ labelKey, icon: Icon, keys, color, bg, border }) => {
                    const granted = keys.filter((k) => perms.includes(k));
                    if (granted.length === 0) return null;
                    const label =
                      getTranslationValue(locale, labelKey) ?? labelKey;
                    return (
                      <div
                        key={labelKey}
                        className={`rounded-[12px] border ${border} ${bg} px-4 py-4`}
                      >
                        <div
                          className={`mb-3 flex items-center gap-2 ${color}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-cairo text-[12px] font-extrabold">
                            {label}
                          </span>
                          <span className="ms-auto font-cairo text-[11px] font-bold opacity-70">
                            {granted.length}/{keys.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {keys.map((k) => {
                            const has = perms.includes(k);
                            return (
                              <div
                                key={k}
                                className={`flex items-center gap-2 font-cairo text-[11px] font-bold ${has ? "text-[#111827]" : "text-[#D0D5DD] line-through"}`}
                              >
                                <div
                                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${has ? "bg-current" : "bg-[#D0D5DD]"}`}
                                />
                                {permLabel(k, locale)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={userId}
        targetLabel={
          secretary?.user?.fullName ??
          t("admin.secretaryDetails.offboard.target")
        }
        onSuccess={() => navigate("/admin/secretaries")}
      />
    </>
  );
}
