import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import DoctorProfileProfessionalForm from '@/components/doctor/profile-settings/doctor-profile-professional-form';
import {
  DoctorProfilePageError,
  DoctorProfilePageLoading,
} from '@/components/doctor/profile-settings/doctor-profile-page-states';
import type { DoctorProfessionalEditForm } from '@/components/doctor/profile-settings/doctor-profile-schemas';
import { buildProfessionalChangeItems } from '@/components/doctor/profile-settings/doctor-profile-utils';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import {
  useDoctorProfile,
  useSubmitDoctorProfileChangeRequest,
} from '@/hooks';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export default function DoctorProfileProfessionalEditPage() {
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
        reason: 'طلب تحديث المعلومات المهنية',
      });
      toast('تم إرسال طلب التعديل للمراجعة.', {
        title: 'إرسال للمراجعة',
        variant: 'success',
      });
      navigate('/doctor/profile-settings', { replace: true });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إرسال الطلب',
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
        <title>تعديل المعلومات المهنية • LMJ Health</title>
      </Helmet>
      <DoctorProfileProfessionalForm
        doctor={profileQuery.data.doctor}
        busy={submitChangeRequest.isPending}
        onSubmit={handleSubmit}
        onNoChanges={() => {
          toast('لم يتم تغيير أي حقل مهني.', {
            title: 'لا توجد تغييرات',
            variant: 'error',
          });
        }}
      />
    </>
  );
}
