import { Helmet } from "react-helmet-async";
import { Briefcase, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorProfileConfirmDialog from "@/components/doctor/profile-settings/doctor-profile-confirm-dialog";
import DoctorProfileHeroCard from "@/components/doctor/profile-settings/doctor-profile-hero-card";
import DoctorProfileInfoBanner from "@/components/doctor/profile-settings/doctor-profile-info-banner";
import DoctorProfileSectionCard from "@/components/doctor/profile-settings/doctor-profile-section-card";
import DoctorProfileStatsRow from "@/components/doctor/profile-settings/doctor-profile-stats-row";
import DoctorProfileSecurityPanel from "@/components/doctor/profile-settings/doctor-profile-security-panel";
import {
  DoctorProfilePageError,
  DoctorProfilePageLoading,
} from "@/components/doctor/profile-settings/doctor-profile-page-states";
import { useDoctorProfileConfirm } from "@/components/doctor/profile-settings/use-doctor-profile-confirm";
import {
  buildProfileFieldRows,
  parseExperienceYears,
} from "@/components/doctor/profile-settings/doctor-profile-utils";
import {
  useDoctorHomeSnapshot,
  useDoctorProfile,
  useDoctorSelfRating,
} from "@/hooks";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";

export default function DoctorProfileSettingsPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const profileQuery = useDoctorProfile();
  const snapshotQuery = useDoctorHomeSnapshot();
  const ratingQuery = useDoctorSelfRating({
    doctorId: profileQuery.data?.doctor?._id,
    searchHint:
      profileQuery.data?.doctor?.user?.email ??
      profileQuery.data?.doctor?.user?.phone ??
      null,
  });
  const {
    confirmKind,
    confirmOpen,
    requestConfirm,
    closeConfirm,
    handleConfirm,
  } = useDoctorProfileConfirm();

  if (isAwaitingInitialQueryData(profileQuery.data, profileQuery.isError)) {
    return <DoctorProfilePageLoading />;
  }

  if (profileQuery.isError || !profileQuery.data?.doctor) {
    return <DoctorProfilePageError />;
  }

  const doctor = profileQuery.data.doctor;
  const user = doctor.user;
  const fieldRows = buildProfileFieldRows(doctor, t, locale);
  const consultationsCount =
    snapshotQuery.data?.snapshot?.counts?.consultations ?? 0;
  const experienceYears = parseExperienceYears(doctor.bio);
  const ratingValue =
    ratingQuery.data?.averageRating != null
      ? ratingQuery.data.averageRating.toFixed(1)
      : "—";

  return (
    <>
      <Helmet>
        <title>{t("doctor.profileSettings.pageTitle")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5 pb-8 sm:pb-10">
        <DoctorProfileHeroCard
          fullName={user?.fullName}
          specialization={doctor.specialization}
          photoUrl={user?.photoUrl}
          isApproved={doctor.isApproved}
        />

        <DoctorProfileStatsRow
          items={[
            {
              key: "consultations",
              value: consultationsCount,
              label: t("doctor.profileSettings.consultation"),
            },
            {
              key: "experience",
              value: experienceYears ?? "—",
              label: t("doctor.profileSettings.yearsExperience"),
            },
            {
              key: "rating",
              value: ratingValue,
              label: t("doctor.profileSettings.rating"),
            },
          ]}
        />

        <DoctorProfileInfoBanner>
          {t("doctor.profileSettings.infoBanner")}
        </DoctorProfileInfoBanner>

        <DoctorProfileSectionCard
          title={t("doctor.profileSettings.personalInfo")}
          icon={UserRound}
          fields={fieldRows.personal}
        />

        <DoctorProfileSectionCard
          title={t("doctor.profileSettings.professionalInfo")}
          icon={Briefcase}
          fields={fieldRows.professional}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              requestConfirm("navigate-personal-edit", () => {
                navigate("/doctor/profile-settings/personal/edit");
              })
            }
            className="flex h-[48px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-primary bg-white font-cairo text-[14px] font-extrabold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] transition hover:bg-[#F0FAFA]"
          >
            {t("doctor.profileSettings.editPersonal")}
          </button>
          <button
            type="button"
            onClick={() =>
              requestConfirm("navigate-professional-edit", () => {
                navigate("/doctor/profile-settings/professional/edit");
              })
            }
            className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.25)] transition hover:bg-[#0A7A77]"
          >
            {t("doctor.profileSettings.editProfessional")}
          </button>
        </div>

        <DoctorProfileSecurityPanel />

        <DoctorProfileConfirmDialog
          kind={confirmKind}
          open={confirmOpen}
          onOpenChange={closeConfirm}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  );
}
