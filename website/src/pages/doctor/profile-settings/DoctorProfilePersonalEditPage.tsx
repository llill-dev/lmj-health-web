import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { DoctorPageBackButton } from '@/components/doctor/shared/doctor-page-back-button';
import DoctorProfilePersonalForm, {
  modeToConsultationTypes,
} from '@/components/doctor/profile-settings/doctor-profile-personal-form';
import type { DoctorPersonalEditForm } from '@/components/doctor/profile-settings/doctor-profile-schemas';
import {
  DoctorProfilePageError,
  DoctorProfilePageLoading,
} from '@/components/doctor/profile-settings/doctor-profile-page-states';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { persistDoctorProfileSuccessNavState } from '@/lib/doctor/profile/doctorProfileSuccessNavState';
import { useDoctorProfile, useUpdateDoctorProfile } from '@/hooks';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export default function DoctorProfilePersonalEditPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profileQuery = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();

  const handleSubmit = async (
    values: DoctorPersonalEditForm,
    photo: File | null,
  ) => {
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName.trim(),
        address: values.address.trim(),
        dateOfBirth: values.dateOfBirth,
        bio: values.bio?.trim() || undefined,
        consultationFee: values.consultationFee.trim()
          ? Number(values.consultationFee)
          : undefined,
        consultationTypes: modeToConsultationTypes(values.consultationMode),
        photo,
      });
      const successState = {
        flow: 'personal_updated' as const,
        redirectTo: '/doctor/dashboard',
      };
      persistDoctorProfileSuccessNavState(successState);
      navigate('/doctor/profile-update-success', {
        replace: true,
        state: successState,
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر حفظ التغييرات',
        variant: 'error',
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
        <title>تعديل المعلومات الشخصية • LMJ Health</title>
      </Helmet>
      <div className="mb-4">
        <DoctorPageBackButton fallbackTo="/doctor/dashboard" />
      </div>
      <DoctorProfilePersonalForm
        doctor={profileQuery.data.doctor}
        busy={updateProfile.isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
}
