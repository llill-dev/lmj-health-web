import { Link } from 'react-router-dom';
import type { DoctorSpecializationReviewState } from '@/lib/admin/doctors/doctorSpecializationReview';
import { useI18n } from '@/i18n/provider';

const toneClasses: Record<
  DoctorSpecializationReviewState['statusTone'],
  { box: string; text: string }
> = {
  success: {
    box: 'border-[#BBF7D0] bg-[#F0FDF4]',
    text: 'text-[#166534]',
  },
  warning: {
    box: 'border-[#FDE68A] bg-[#FFFBEB]',
    text: 'text-[#92400E]',
  },
  neutral: {
    box: 'border-[#E5E7EB] bg-[#F9FAFB]',
    text: 'text-[#374151]',
  },
};

type BannerCopy = {
  title: string;
  body: string;
  showManageLink: boolean;
};

function resolveBannerCopy(
  state: DoctorSpecializationReviewState,
  t: (key: string) => string,
): BannerCopy {
  if (state.mode === 'catalog') {
    return {
      title: t('adminVerificationRequests.specBanner.catalogTitle'),
      body: t('adminVerificationRequests.specBanner.catalogBody').replace('{label}', state.displayLabel),
      showManageLink: false,
    };
  }

  if (state.mode === 'custom_pending') {
    return {
      title: t('adminVerificationRequests.specBanner.customPendingTitle'),
      body: t('adminVerificationRequests.specBanner.customPendingBody').replace('{label}', state.displayLabel),
      showManageLink: true,
    };
  }

  const specialtyPart =
    state.displayLabel !== '—'
      ? t('adminVerificationRequests.specBanner.unresolvedSpecialtyPrefix').replace('{label}', state.displayLabel)
      : '';

  return {
    title: t('adminVerificationRequests.specBanner.unresolvedTitle'),
    body: `${specialtyPart}${t('adminVerificationRequests.specBanner.unresolvedBody')}`,
    showManageLink: true,
  };
}

export function DoctorSpecializationReviewBanner({
  state,
  showManageLink = true,
}: {
  state: DoctorSpecializationReviewState;
  showManageLink?: boolean;
}) {
  const { t } = useI18n();
  const tone = toneClasses[state.statusTone];
  const copy = resolveBannerCopy(state, t);

  return (
    <div
      className={`rounded-[12px] border px-4 py-3 text-start ${tone.box}`}
    >
      <div className={`font-cairo text-[13px] font-extrabold ${tone.text}`}>
        {copy.title}
      </div>
      <p
        className={`mt-2 font-cairo text-[12px] font-semibold leading-[20px] ${tone.text}`}
      >
        {copy.body}
      </p>
      {showManageLink && copy.showManageLink ? (
        <Link
          to='/admin/doctor-specializations'
          className='mt-3 inline-block font-cairo text-[12px] font-extrabold text-primary underline-offset-2 hover:underline'
        >
          {t('adminVerificationRequests.specBanner.manageLink')}
        </Link>
      ) : null}
    </div>
  );
}
