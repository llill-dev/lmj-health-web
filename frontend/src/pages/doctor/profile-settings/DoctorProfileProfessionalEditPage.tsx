import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { DoctorPageBackButton } from "@/components/doctor/shared/doctor-page-back-button";
import DoctorProfileProfessionalForm from "@/components/doctor/profile-settings/doctor-profile-professional-form";
import {
  DoctorProfilePageError,
  DoctorProfilePageLoading,
} from "@/components/doctor/profile-settings/doctor-profile-page-states";
import type { DoctorProfessionalEditForm } from "@/components/doctor/profile-settings/doctor-profile-schemas";
import { buildProfessionalChangeItems } from "@/components/doctor/profile-settings/doctor-profile-utils";
import { useToast } from "@/components/ui/ToastProvider";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useDoctorProfile, useSubmitDoctorProfileChangeRequest } from "@/hooks";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";

export default function DoctorProfileProfessionalEditPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const profileQuery = useDoctorProfile();
  const submitChangeRequest = useSubmitDoctorProfileChangeRequest();

  const handleSubmit = async (values: DoctorProfessionalEditForm) => {
    const doctor = profileQuery.data?.doctor;
    if (!doctor) return;

    const items = buildProfessionalChangeItems(doctor, values);
    if (!items.length) return;

    try {
      await submitChangeRequest.mutateAsync({
        items,
        reason: t("doctor.profileProfessionalEdit.requestReason"),
      });
      toast(t("doctor.profileProfessionalEdit.sentForReview"), {
        title: t("doctor.profileProfessionalEdit.sentForReviewTitle"),
        variant: "success",
      });
      navigate("/doctor/profile-settings", { replace: true });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.profileProfessionalEdit.sendFailed"),
        variant: "error",
      });
      throw error;
    }
  };

  if (isAwaitingInitialQueryData(profileQuery.data, profileQuery.isError)) {
    return <DoctorProfilePageLoading />;
  }

  if (profileQuery.isError || !profileQuery.data?.doctor) {
    return <DoctorProfilePageError />;
  }

  return (
    <>
      <Helmet>
        <title>
          {t("doctor.profileProfessionalEdit.pageTitle")} • LMJ Health
        </title>
      </Helmet>
      <div className="mb-4">
        <DoctorPageBackButton fallbackTo="/doctor/profile-settings" />
      </div>
      <DoctorProfileProfessionalForm
        doctor={profileQuery.data.doctor}
        busy={submitChangeRequest.isPending}
        onSubmit={handleSubmit}
        onNoChanges={() => {
          toast(t("doctor.profileProfessionalEdit.noChanges"), {
            title: t("doctor.profileProfessionalEdit.noChangesTitle"),
            variant: "error",
          });
        }}
      />
    </>
  );
}
