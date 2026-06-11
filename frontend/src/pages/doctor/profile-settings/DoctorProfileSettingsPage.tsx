import { Helmet } from 'react-helmet-async';
import { Briefcase, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorProfileConfirmDialog from '@/components/doctor/profile-settings/doctor-profile-confirm-dialog';
import DoctorProfileHeroCard from '@/components/doctor/profile-settings/doctor-profile-hero-card';
import DoctorProfileInfoBanner from '@/components/doctor/profile-settings/doctor-profile-info-banner';
import DoctorProfileSectionCard from '@/components/doctor/profile-settings/doctor-profile-section-card';
import DoctorProfileStatsRow from '@/components/doctor/profile-settings/doctor-profile-stats-row';
import DoctorProfileSecurityPanel from '@/components/doctor/profile-settings/doctor-profile-security-panel';
import {
  DoctorProfilePageError,
  DoctorProfilePageLoading,
} from '@/components/doctor/profile-settings/doctor-profile-page-states';
import { useDoctorProfileConfirm } from '@/components/doctor/profile-settings/use-doctor-profile-confirm';
import {
  buildProfileFieldRows,
  parseExperienceYears,
} from '@/components/doctor/profile-settings/doctor-profile-utils';
import {
  useDoctorHomeSnapshot,
  useDoctorProfile,
  useDoctorSelfRating,
} from '@/hooks';

export default function DoctorProfileSettingsPage() {
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

  if (profileQuery.isLoading) {
    return <DoctorProfilePageLoading />;
  }

  if (profileQuery.isError || !profileQuery.data?.doctor) {
    return <DoctorProfilePageError />;
  }

  const doctor = profileQuery.data.doctor;
  const user = doctor.user;
  const fieldRows = buildProfileFieldRows(doctor);
  const consultationsCount =
    snapshotQuery.data?.snapshot?.counts?.consultations ?? 0;
  const experienceYears = parseExperienceYears(doctor.bio);
  const ratingValue =
    ratingQuery.data?.averageRating != null
      ? ratingQuery.data.averageRating.toFixed(1)
      : '—';

  return (
    <>
      <Helmet>
        <title>الملف الشخصي • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="pb-10 space-y-5">
        <DoctorProfileHeroCard
          fullName={user?.fullName}
          specialization={doctor.specialization}
          photoUrl={user?.photoUrl}
          isApproved={doctor.isApproved}
        />

        <DoctorProfileStatsRow
          items={[
            {
              key: 'consultations',
              value: consultationsCount,
              label: 'استشارة',
            },
            {
              key: 'experience',
              value: experienceYears ?? '—',
              label: 'سنة خبرة',
            },
            {
              key: 'rating',
              value: ratingValue,
              label: 'التقييم',
            },
          ]}
        />

        <DoctorProfileInfoBanner>
          لتعديل معلوماتك استخدم أزرار «تعديل المعلومات الشخصية» أو «تعديل
          المعلومات المهنية» أدناه. التعديلات المهنية تخضع لمراجعة الإدارة.
        </DoctorProfileInfoBanner>

        <DoctorProfileSectionCard
          title="المعلومات الشخصية"
          icon={UserRound}
          fields={fieldRows.personal}
        />

        <DoctorProfileSectionCard
          title="المعلومات المهنية"
          icon={Briefcase}
          fields={fieldRows.professional}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              requestConfirm('navigate-personal-edit', () => {
                navigate('/doctor/profile-settings/personal/edit');
              })
            }
            className="flex h-[48px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-primary bg-white font-cairo text-[14px] font-extrabold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] transition hover:bg-[#F0FAFA]"
          >
            تعديل المعلومات الشخصية
          </button>
          <button
            type="button"
            onClick={() =>
              requestConfirm('navigate-professional-edit', () => {
                navigate('/doctor/profile-settings/professional/edit');
              })
            }
            className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.25)] transition hover:bg-[#0A7A77]"
          >
            تعديل المعلومات المهنية
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
