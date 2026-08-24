import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { DoctorPageBackButton } from '@/components/doctor/shared/doctor-page-back-button';
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
import { useI18n } from '@/i18n/provider';

export default function DoctorProfileProfessionalEditPage() {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
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
        reason: tr('طلب تحديث المعلومات المهنية', 'Request to update professional information'),
      });
      toast(tr('تم إرسال طلب التعديل للمراجعة.', 'The edit request has been sent for review.'), {
        title: tr('إرسال للمراجعة', 'Sent for review'),
        variant: 'success',
      });
      navigate('/doctor/profile-settings', { replace: true });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر إرسال الطلب', 'Failed to send the request'),
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
        <title>{tr('تعديل المعلومات المهنية', 'Edit professional information')} • LMJ Health</title>
      </Helmet>
      <div className="mb-4">
        <DoctorPageBackButton fallbackTo="/doctor/profile-settings" />
      </div>
      <DoctorProfileProfessionalForm
        doctor={profileQuery.data.doctor}
        busy={submitChangeRequest.isPending}
        onSubmit={handleSubmit}
        onNoChanges={() => {
          toast(tr('لم يتم تغيير أي حقل مهني.', 'No professional field was changed.'), {
            title: tr('لا توجد تغييرات', 'No changes'),
            variant: 'error',
          });
        }}
      />
    </>
  );
}
